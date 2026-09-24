#!/usr/bin/env bash
set -euo pipefail

billing_hub_ref='ahqauomkgflopxgnlndd'
guard_path='.github/scripts/check-retired-supabase-references.sh'

# Scan every tracked text file, not only runtime directories. The encoded value
# is the retired project reference as it appears inside legacy anon JWTs.
retired_identifier_pattern='asjhkidpuhqodryczuth|YXNqaGtpZHB1aHFvZHJ5Y3p1dGg|LEGACY_SUPABASE_URL|LEGACY_SUPABASE_ANON_KEY|LEGACY_SUPABASE_PUBLISHABLE_KEY|valorwell-backend|therapist-crm-retirement-(import|check)'

if git grep -n -I -i -E "$retired_identifier_pattern" -- . \
  ":(exclude)$guard_path"; then
  echo "Retired Supabase project or repository identifier detected." >&2
  exit 1
fi

# Catch human-readable, slug, and database-source variants such as spaces,
# hyphens, or underscores. Historical references remain available in Git history.
if git grep -n -I -i -E 'therapist[[:space:]_-]*crm' -- . \
  ":(exclude)$guard_path"; then
  echo "Retired project name detected in the current website tree." >&2
  exit 1
fi

unexpected_urls="$({
  git grep -n -I -E 'https://[a-z0-9]+\.(functions\.)?supabase\.co' -- . \
    ":(exclude)$guard_path" 2>/dev/null || true
} | grep -v "$billing_hub_ref" || true)"

if [[ -n "$unexpected_urls" ]]; then
  echo "A Supabase project URL outside Billing Hub was detected:" >&2
  echo "$unexpected_urls" >&2
  exit 1
fi

if git ls-files 'supabase/migrations/*' | grep -q .; then
  echo "The website repository must not own database migrations. Billing Hub schema changes belong in the canonical backend repository." >&2
  git ls-files 'supabase/migrations/*' >&2
  exit 1
fi

private_resource_references="$({
  git grep -n -I -E "\\.from\\([\\"']website_resources[\\"']\\)|/rest/v1/website_resources([^_[:alnum:]]|$)" -- src scripts 2>/dev/null || true
})"

if [[ -n "$private_resource_references" ]]; then
  echo "Public website code must read public.website_resources_public, not public.website_resources:" >&2
  echo "$private_resource_references" >&2
  exit 1
fi

retired_function_paths=(
  supabase/functions/create-mission-partner
  supabase/functions/send-welcome-email
  supabase/functions/backfill-competitor-auth
  supabase/functions/send-bulk-welcome
)

for path in "${retired_function_paths[@]}"; do
  if git ls-files "$path/*" | grep -q .; then
    echo "Retired website function source detected: $path" >&2
    exit 1
  fi
done

if ! grep -qx "project_id = \"$billing_hub_ref\"" supabase/config.toml; then
  echo "Website Supabase configuration must identify Billing Hub." >&2
  exit 1
fi

project_id_lines="$(grep -RIn --include='*.toml' -E '^[[:space:]]*project_id[[:space:]]*=' . 2>/dev/null || true)"
unexpected_project_ids="$(printf '%s\n' "$project_id_lines" | grep -v "$billing_hub_ref" || true)"
if [[ -n "$unexpected_project_ids" ]]; then
  echo "A non-Billing-Hub Supabase project_id was detected:" >&2
  echo "$unexpected_project_ids" >&2
  exit 1
fi

echo "Retired Supabase dependency guard passed."
