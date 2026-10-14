-- Resource sheet import: schema + import function.
--
-- Applied to Billing Hub (project ahqauomkgflopxgnlndd). Billing Hub owns its
-- migration history; this file is the website repo's copy of the exact SQL so
-- the importer and the page templates can be reviewed alongside it.
--
-- Everything here is additive. Existing published pages keep rendering exactly
-- as before until an import writes new content into the new columns.

-- 1. New article fields -------------------------------------------------------

alter table public.website_resources
  add column if not exists quick_answer text,
  add column if not exists in_practice_markdown text,
  add column if not exists reviewed_by text not null default 'ValorWell',
  add column if not exists last_reviewed_on date,
  add column if not exists cta text not null default 'find_care',
  add column if not exists group_slug text,
  add column if not exists import_content_hash text,
  add column if not exists import_synced_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.website_resources'::regclass
      and conname = 'website_resources_cta_check'
  ) then
    alter table public.website_resources
      add constraint website_resources_cta_check
      check (cta in ('find_care', 'join_network', 'support_foundation'));
  end if;
end $$;

-- Article URLs are /resources/{category}/{slug}, so a slug only has to be
-- unique inside its category (both CHAMPVA and VA Community Care have a
-- key-terms-glossary page). Category rows have a null category_slug.
alter table public.website_resources
  drop constraint if exists website_resources_slug_unique;

create unique index if not exists website_resources_route_unique
  on public.website_resources (tenant_id, coalesce(category_slug, ''), slug);

grant select (
  quick_answer, in_practice_markdown, reviewed_by, last_reviewed_on, cta, group_slug
) on public.website_resources to anon, authenticated;

-- 2. Public projection ----------------------------------------------------------
-- Same columns, options, and filter as before, with the new fields appended.

create or replace view public.website_resources_public
with (security_barrier = true, security_invoker = on) as
select
  wr.id,
  wr.tenant_id,
  wr.slug,
  wr.title,
  wr.primary_question,
  wr.summary,
  wr.body_markdown,
  wr.faq,
  wr.audience_tags,
  wr.topic_aliases,
  wr.status,
  wr.published_at,
  wr.resource_kind,
  wr.category_slug,
  wr.content_schema_version,
  wr.editorial_type,
  wr.featured,
  wr.sort_order,
  wr.seo_title,
  wr.seo_description,
  wr.public_updated_at,
  wr.quick_answer,
  wr.in_practice_markdown,
  wr.reviewed_by,
  wr.last_reviewed_on,
  wr.cta,
  wr.group_slug
from public.website_resources wr
where wr.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  and wr.status = 'published'::text;

grant select on public.website_resources_public to anon, authenticated;

-- 3. Topic hub groups -----------------------------------------------------------

create table if not exists public.website_resource_groups (
  tenant_id uuid not null default '00000000-0000-0000-0000-000000000001'::uuid,
  category_slug text not null,
  group_slug text not null,
  name text not null,
  display_order integer not null default 100,
  intro text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, category_slug, group_slug),
  constraint website_resource_groups_name_not_blank check (btrim(name) <> ''),
  constraint website_resource_groups_slug_format check (group_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

alter table public.website_resource_groups enable row level security;
revoke all on public.website_resource_groups from anon, authenticated;
grant select on public.website_resource_groups to anon, authenticated;

drop policy if exists website_resource_groups_public_read on public.website_resource_groups;
create policy website_resource_groups_public_read
  on public.website_resource_groups
  for select to anon, authenticated
  using (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    and exists (
      select 1 from public.website_resources_public c
      where c.resource_kind = 'category' and c.slug = website_resource_groups.category_slug
    )
  );

-- 4. Redirects for retired pages ----------------------------------------------

create table if not exists public.website_resource_redirects (
  tenant_id uuid not null default '00000000-0000-0000-0000-000000000001'::uuid,
  from_path text not null,
  to_path text not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, from_path),
  constraint website_resource_redirects_from_format
    check (from_path ~ '^/resources/[a-z0-9-]+(/[a-z0-9-]+)?$'),
  constraint website_resource_redirects_to_format
    check (to_path ~ '^/resources(/[a-z0-9-]+){0,2}$'),
  constraint website_resource_redirects_not_self check (from_path <> to_path)
);

alter table public.website_resource_redirects enable row level security;
revoke all on public.website_resource_redirects from anon, authenticated;
grant select on public.website_resource_redirects to anon, authenticated;

drop policy if exists website_resource_redirects_public_read on public.website_resource_redirects;
create policy website_resource_redirects_public_read
  on public.website_resource_redirects
  for select to anon, authenticated
  using (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 5. Import function ------------------------------------------------------------
-- Takes payload already parsed and validated by the website importer
-- (supabase/functions/_shared/resourceSheet.ts) and writes it in one
-- transaction. Sections are optional so large imports can be sent in batches:
-- categories and groups first, then articles, then relations/redirects/archive.
--
-- It never deletes a resource. Pages missing from the payload are untouched.
-- With p_dry_run = true every write is rolled back and only the report returns.

create or replace function public.import_website_resources(
  p_payload jsonb,
  p_dry_run boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant constant uuid := '00000000-0000-0000-0000-000000000001';
  v_now timestamptz := now();
  r jsonb;
  s jsonb;
  v_id uuid;
  v_existing record;
  v_target uuid;
  v_i integer;
  v_created text[] := '{}';
  v_updated text[] := '{}';
  v_republished text[] := '{}';
  v_unchanged integer := 0;
  v_cat_created text[] := '{}';
  v_cat_updated text[] := '{}';
  v_cat_archived text[] := '{}';
  v_groups integer := 0;
  v_rel_resources integer := 0;
  v_rel_links integer := 0;
  v_rel_missing text[] := '{}';
  v_redirects integer := 0;
  v_archived text[] := '{}';
  v_archive_missing text[] := '{}';
  v_report jsonb;
begin
  if jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception 'payload must be a JSON object';
  end if;

  begin
    -- Categories ------------------------------------------------------------
    for r in select * from jsonb_array_elements(coalesce(p_payload->'categories', '[]'::jsonb)) loop
      select id, status into v_existing from website_resources
       where tenant_id = v_tenant and resource_kind = 'category' and slug = r->>'slug';

      if r->>'status' = 'archived' then
        if v_existing.id is not null then
          update website_resources set status = 'archived' where id = v_existing.id and status <> 'archived';
          if found then v_cat_archived := v_cat_archived || (r->>'slug'); end if;
        end if;
        continue;
      end if;

      if v_existing.id is null then
        insert into website_resources (
          tenant_id, canonical_topic_key, slug, title, primary_question, summary, body_markdown,
          status, published_at, resource_kind, category_slug, editorial_type, sort_order,
          public_updated_at, import_synced_at
        ) values (
          v_tenant, 'category/' || (r->>'slug'), r->>'slug', r->>'title', r->>'primary_question',
          r->>'summary', r->>'body_markdown', 'published', v_now, 'category', null, 'category',
          coalesce((r->>'sort_order')::int, 100), v_now, v_now
        );
        v_cat_created := v_cat_created || (r->>'slug');
      else
        update website_resources set
          title = r->>'title',
          summary = coalesce(nullif(btrim(r->>'summary'), ''), summary),
          sort_order = coalesce((r->>'sort_order')::int, sort_order),
          status = 'published',
          published_at = coalesce(published_at, v_now),
          import_synced_at = v_now
        where id = v_existing.id
          and (title is distinct from r->>'title'
            or summary is distinct from coalesce(nullif(btrim(r->>'summary'), ''), summary)
            or sort_order is distinct from coalesce((r->>'sort_order')::int, sort_order)
            or status <> 'published');
        if found then v_cat_updated := v_cat_updated || (r->>'slug'); end if;
      end if;
    end loop;

    -- Groups ----------------------------------------------------------------
    for r in select * from jsonb_array_elements(coalesce(p_payload->'groups', '[]'::jsonb)) loop
      insert into website_resource_groups (tenant_id, category_slug, group_slug, name, display_order, intro)
      values (v_tenant, r->>'category_slug', r->>'group_slug', r->>'name',
              coalesce((r->>'display_order')::int, 100), nullif(btrim(coalesce(r->>'intro', '')), ''))
      on conflict (tenant_id, category_slug, group_slug) do update set
        name = excluded.name,
        display_order = excluded.display_order,
        intro = excluded.intro,
        updated_at = v_now
      where (website_resource_groups.name, website_resource_groups.display_order, website_resource_groups.intro)
        is distinct from (excluded.name, excluded.display_order, excluded.intro);
      if found then v_groups := v_groups + 1; end if;
    end loop;

    -- Articles --------------------------------------------------------------
    for r in select * from jsonb_array_elements(coalesce(p_payload->'articles', '[]'::jsonb)) loop
      if not exists (
        select 1 from website_resources
        where tenant_id = v_tenant and resource_kind = 'category'
          and slug = r->>'category_slug' and status = 'published'
      ) then
        raise exception 'article %/% references a category that is not published', r->>'category_slug', r->>'slug';
      end if;

      select id, status, import_content_hash into v_existing from website_resources
       where tenant_id = v_tenant and resource_kind = 'article'
         and category_slug = r->>'category_slug' and slug = r->>'slug';

      if v_existing.id is not null
         and v_existing.status = 'published'
         and v_existing.import_content_hash is not distinct from r->>'content_hash' then
        v_unchanged := v_unchanged + 1;
        continue;
      end if;

      if v_existing.id is null then
        insert into website_resources (
          tenant_id, canonical_topic_key, slug, title, primary_question, summary, body_markdown,
          faq, audience_tags, topic_aliases, status, published_at, resource_kind, category_slug,
          content_schema_version, editorial_type, sort_order, public_updated_at,
          quick_answer, in_practice_markdown, reviewed_by, last_reviewed_on, cta, group_slug,
          import_content_hash, import_synced_at
        ) values (
          v_tenant, (r->>'category_slug') || '/' || (r->>'slug'), r->>'slug', r->>'title',
          r->>'primary_question', r->>'summary', r->>'body_markdown',
          coalesce(r->'faq', '[]'::jsonb),
          array(select jsonb_array_elements_text(coalesce(r->'audience_tags', '[]'::jsonb))),
          array(select jsonb_array_elements_text(coalesce(r->'topic_aliases', '[]'::jsonb))),
          'published', v_now, 'article', r->>'category_slug',
          3, 'guide', coalesce((r->>'sort_order')::int, 100), v_now,
          r->>'quick_answer', nullif(btrim(coalesce(r->>'in_practice_markdown', '')), ''),
          coalesce(nullif(btrim(r->>'reviewed_by'), ''), 'ValorWell'),
          nullif(r->>'last_reviewed_on', '')::date,
          coalesce(r->>'cta', 'find_care'), r->>'group_slug',
          r->>'content_hash', v_now
        ) returning id into v_id;
        v_created := v_created || ((r->>'category_slug') || '/' || (r->>'slug'));
      else
        v_id := v_existing.id;
        update website_resources set
          title = r->>'title',
          primary_question = r->>'primary_question',
          summary = r->>'summary',
          body_markdown = r->>'body_markdown',
          faq = coalesce(r->'faq', '[]'::jsonb),
          audience_tags = array(select jsonb_array_elements_text(coalesce(r->'audience_tags', '[]'::jsonb))),
          topic_aliases = array(select jsonb_array_elements_text(coalesce(r->'topic_aliases', '[]'::jsonb))),
          status = 'published',
          published_at = coalesce(published_at, v_now),
          content_schema_version = 3,
          sort_order = coalesce((r->>'sort_order')::int, sort_order),
          public_updated_at = v_now,
          quick_answer = r->>'quick_answer',
          in_practice_markdown = nullif(btrim(coalesce(r->>'in_practice_markdown', '')), ''),
          reviewed_by = coalesce(nullif(btrim(r->>'reviewed_by'), ''), 'ValorWell'),
          last_reviewed_on = nullif(r->>'last_reviewed_on', '')::date,
          cta = coalesce(r->>'cta', 'find_care'),
          group_slug = r->>'group_slug',
          import_content_hash = r->>'content_hash',
          import_synced_at = v_now
        where id = v_id;
        if v_existing.status = 'published' then
          v_updated := v_updated || ((r->>'category_slug') || '/' || (r->>'slug'));
        else
          v_republished := v_republished || ((r->>'category_slug') || '/' || (r->>'slug'));
        end if;
      end if;

      -- Sources are replaced as a set whenever the content changes.
      delete from website_resource_sources where tenant_id = v_tenant and resource_id = v_id;
      v_i := 0;
      for s in select * from jsonb_array_elements(coalesce(r->'sources', '[]'::jsonb)) loop
        v_i := v_i + 1;
        insert into website_resource_sources (
          tenant_id, resource_id, citation_key, organization, title, url, source_type,
          verified_at, is_public, display_order
        ) values (
          v_tenant, v_id, 'source-' || lpad(v_i::text, 2, '0'), s->>'organization', s->>'title',
          s->>'url', coalesce(s->>'source_type', 'official'),
          nullif(r->>'last_reviewed_on', '')::timestamptz, true, v_i
        ) on conflict (tenant_id, resource_id, url) do nothing;
      end loop;
    end loop;

    -- Related pages ---------------------------------------------------------
    for r in select * from jsonb_array_elements(coalesce(p_payload->'relations', '[]'::jsonb)) loop
      select id into v_id from website_resources
       where tenant_id = v_tenant and resource_kind = 'article'
         and category_slug = split_part(r->>'from', '/', 1) and slug = split_part(r->>'from', '/', 2);
      if v_id is null then
        v_rel_missing := v_rel_missing || (r->>'from');
        continue;
      end if;

      delete from website_resource_relations
       where tenant_id = v_tenant and resource_id = v_id and relation_type = 'related';
      v_rel_resources := v_rel_resources + 1;
      v_i := 0;
      for s in select * from jsonb_array_elements(coalesce(r->'to', '[]'::jsonb)) loop
        v_i := v_i + 1;
        select id into v_target from website_resources
         where tenant_id = v_tenant and resource_kind = 'article' and status = 'published'
           and category_slug = split_part(s #>> '{}', '/', 1) and slug = split_part(s #>> '{}', '/', 2);
        if v_target is null or v_target = v_id then
          v_rel_missing := v_rel_missing || ((r->>'from') || ' -> ' || (s #>> '{}'));
          continue;
        end if;
        insert into website_resource_relations (tenant_id, resource_id, related_resource_id, relation_type, display_order)
        values (v_tenant, v_id, v_target, 'related', v_i)
        on conflict do nothing;
        v_rel_links := v_rel_links + 1;
      end loop;
    end loop;

    -- Retired pages ---------------------------------------------------------
    for r in select * from jsonb_array_elements(coalesce(p_payload->'archive', '[]'::jsonb)) loop
      update website_resources set status = 'archived'
       where tenant_id = v_tenant and resource_kind = 'article'
         and category_slug = r->>'category_slug' and slug = r->>'slug' and status <> 'archived';
      if found then
        v_archived := v_archived || ((r->>'category_slug') || '/' || (r->>'slug'));
      elsif not exists (
        select 1 from website_resources where tenant_id = v_tenant and resource_kind = 'article'
          and category_slug = r->>'category_slug' and slug = r->>'slug'
      ) then
        v_archive_missing := v_archive_missing || ((r->>'category_slug') || '/' || (r->>'slug'));
      end if;
    end loop;

    for r in select * from jsonb_array_elements(coalesce(p_payload->'redirects', '[]'::jsonb)) loop
      insert into website_resource_redirects (tenant_id, from_path, to_path, reason)
      values (v_tenant, r->>'from_path', r->>'to_path', r->>'reason')
      on conflict (tenant_id, from_path) do update set
        to_path = excluded.to_path, reason = excluded.reason, updated_at = v_now
      where website_resource_redirects.to_path is distinct from excluded.to_path;
      if found then v_redirects := v_redirects + 1; end if;
    end loop;

    -- A redirect may only point at a page that is live after this import.
    for r in
      select jsonb_build_object('from_path', d.from_path, 'to_path', d.to_path) from website_resource_redirects d
      where d.tenant_id = v_tenant
        and d.to_path <> '/resources'
        and not exists (
          select 1 from website_resources w
          where w.tenant_id = v_tenant and w.status = 'published'
            and d.to_path = case when w.resource_kind = 'category'
                                 then '/resources/' || w.slug
                                 else '/resources/' || w.category_slug || '/' || w.slug end
        )
    loop
      raise exception 'redirect % points at % which is not a published page', r->>'from_path', r->>'to_path';
    end loop;

    v_report := jsonb_build_object(
      'dry_run', p_dry_run,
      'articles', jsonb_build_object(
        'created', to_jsonb(v_created), 'updated', to_jsonb(v_updated),
        'republished', to_jsonb(v_republished), 'unchanged', v_unchanged),
      'categories', jsonb_build_object(
        'created', to_jsonb(v_cat_created), 'updated', to_jsonb(v_cat_updated),
        'archived', to_jsonb(v_cat_archived)),
      'groups_changed', v_groups,
      'relations', jsonb_build_object(
        'resources', v_rel_resources, 'links', v_rel_links, 'missing', to_jsonb(v_rel_missing)),
      'redirects_changed', v_redirects,
      'archived', jsonb_build_object('pages', to_jsonb(v_archived), 'not_found', to_jsonb(v_archive_missing))
    );

    if p_dry_run then
      raise exception using errcode = 'VWDRY', message = 'dry run rollback';
    end if;
  exception
    when sqlstate 'VWDRY' then
      null; -- writes rolled back; report variables survive.
  end;

  return v_report;
end;
$$;

revoke all on function public.import_website_resources(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.import_website_resources(jsonb, boolean) to service_role;
