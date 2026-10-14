// Imports the "ValorWell Website Resources (Master)" sheet into
// public.website_resources.
//
// POST with header `Authorization: Bearer <RESOURCE_IMPORT_TOKEN>` and JSON:
//   {
//     "dry_run": true,                 // default true; false writes changes
//     "pages_csv": "...",              // the Pages tab as CSV
//     "categories_csv": "...",         // the Categories tab as CSV
//     "groups_csv": "..."              // the Groups tab as CSV
//   }
//
// Rows with problems are skipped and listed in the response; every other row
// is imported in a single transaction. Nothing is ever deleted: pages missing
// from the sheet are left alone, and retired rows become redirects.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildImport, parseCsv } from "../_shared/resourceSheet.ts";

const jsonHeaders = { "Content-Type": "application/json" };

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

serve(async (req) => {
  if (req.method !== "POST") return reply(405, { ok: false, message: "Method not allowed" });

  const expected = Deno.env.get("RESOURCE_IMPORT_TOKEN") ?? "";
  const supplied = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (expected.length < 32 || !constantTimeEqual(supplied, expected)) {
    return reply(401, { ok: false, message: "Not authorized" });
  }

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.pages_csv !== "string" ||
    typeof body.categories_csv !== "string" ||
    typeof body.groups_csv !== "string"
  ) {
    return reply(400, { ok: false, message: "Send pages_csv, categories_csv, and groups_csv." });
  }
  const dryRun = body.dry_run !== false;

  let built;
  try {
    built = buildImport({
      pages: parseCsv(body.pages_csv),
      categories: parseCsv(body.categories_csv),
      groups: parseCsv(body.groups_csv),
    });
  } catch (error) {
    return reply(422, { ok: false, message: error instanceof Error ? error.message : String(error) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase.rpc("import_website_resources", {
    p_payload: built.payload,
    p_dry_run: dryRun,
  });

  if (error) {
    console.error("import_website_resources failed", error.message);
    return reply(500, {
      ok: false,
      message: `Import failed and nothing was written: ${error.message}`,
      sheet: { summary: built.summary, errors: built.errors, warnings: built.warnings },
    });
  }

  return reply(200, {
    ok: true,
    dry_run: dryRun,
    sheet: { summary: built.summary, errors: built.errors, warnings: built.warnings },
    result: data,
  });
});
