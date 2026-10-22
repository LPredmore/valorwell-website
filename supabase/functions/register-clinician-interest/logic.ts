// Pure decision logic for register-clinician-interest. No Deno/npm imports so
// it can be unit-tested from the website test suite.

export type IntakeResult =
  | "persisted" // new row written and read back
  | "verified_duplicate" // same key already stored for the same applicant
  | "key_conflict" // same key stored for a different applicant
  | "validation_failed"
  | "indeterminate"; // database unreachable; write may or may not exist

export type DbError = { code?: string | null; message?: string | null } | null;

/** Errors meaning the database could not be reached or answer in time. */
export function isDatabaseUnavailable(err: DbError): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = err.message ?? "";
  return (
    /^PGRST00[0-3]$/.test(code) ||
    ["57014", "57P01", "53300", "08000", "08001", "08003", "08006"].includes(code) ||
    /timeout|timed out|connection|fetch failed|network|\b50[234]\b|schema cache/i.test(msg)
  );
}

export function isUniqueViolation(err: DbError): boolean {
  return !!err && (err.code === "23505" || /duplicate key/i.test(err.message ?? ""));
}

export type StoredSubmission = {
  id: string;
  submission_type: string;
  payload: unknown;
};

/** A stored row only counts as "this submission" when type and applicant match. */
export function matchesSubmission(
  row: StoredSubmission | null,
  expected: { firstName: string; lastName: string; email: string },
): boolean {
  if (!row || row.submission_type !== "clinician_application") return false;
  const p = (row.payload ?? {}) as Record<string, unknown>;
  const norm = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");
  return (
    norm(p.email) === norm(expected.email) &&
    norm(p.first_name) === norm(expected.firstName) &&
    norm(p.last_name) === norm(expected.lastName)
  );
}

/** Results the website may count as a completed lead. */
export function isConfirmedPersistence(result: IntakeResult): boolean {
  return result === "persisted" || result === "verified_duplicate";
}

/** One outage alert per hour across all function instances (Resend idempotency). */
export function outageAlertKey(now: Date): string {
  return `clinician-intake-outage-${now.toISOString().slice(0, 13)}`;
}
