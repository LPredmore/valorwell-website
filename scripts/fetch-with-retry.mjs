export const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 520, 522, 524, 544]);
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000];
const REQUEST_TIMEOUT_MS = 30000;
// Whole-build budget across every Billing Hub request, so a long outage fails
// fast instead of hammering the database.
const TOTAL_BUDGET_MS = 180000;

let budgetStartedAt = null;

// Billing Hub is shared; short outages (5xx, timeouts) are retried with
// exponential backoff + jitter. A persistent failure still fails the build so
// no page set ships incomplete and no stale data is substituted.
export async function fetchWithRetry(
  url,
  init,
  {
    delays = RETRY_DELAYS_MS,
    timeoutMs = REQUEST_TIMEOUT_MS,
    totalBudgetMs = TOTAL_BUDGET_MS,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
    random = Math.random,
    now = Date.now,
    label = String(url).replace(/\?.*/, ""),
  } = {},
) {
  if (budgetStartedAt === null) budgetStartedAt = now();
  let lastReason = "unknown";
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    const remaining = totalBudgetMs - (now() - budgetStartedAt);
    if (remaining <= 0) {
      throw new Error(`Billing Hub request ${label} gave up: total retry budget of ${totalBudgetMs / 1000}s used (last: ${lastReason}).`);
    }
    try {
      const controller = new AbortController();
      const limit = Math.min(timeoutMs, remaining);
      const timer = setTimeout(() => controller.abort(new Error(`timed out after ${limit}ms`)), limit);
      let res;
      try {
        res = await fetchImpl(url, { ...init, signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
      if (!RETRYABLE_STATUS.has(res.status) || attempt === delays.length) return res;
      lastReason = `HTTP ${res.status}`;
    } catch (err) {
      lastReason = err?.message ?? String(err);
      if (attempt === delays.length) {
        throw new Error(`Billing Hub request ${label} unreachable after ${attempt + 1} attempts: ${lastReason}`);
      }
    }
    // Full jitter between half and all of the base delay.
    const wait = Math.round(delays[attempt] * (0.5 + random() * 0.5));
    console.warn(`Billing Hub request ${label} failed (${lastReason}); retry ${attempt + 1}/${delays.length} in ${(wait / 1000).toFixed(1)}s`);
    await sleep(wait);
  }
  throw new Error(`Billing Hub request ${label} failed: ${lastReason}`);
}

export function resetRetryBudgetForTests() {
  budgetStartedAt = null;
}
