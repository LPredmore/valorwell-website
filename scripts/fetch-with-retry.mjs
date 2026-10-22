export const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 520, 522, 524, 544]);
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000];
const REQUEST_TIMEOUT_MS = 30000;

// Billing Hub is shared; short outages (502/503/504, timeouts) are retried with
// backoff. A persistent failure still fails the build so no page set ships incomplete.
export async function fetchWithRetry(url, init, { delays = RETRY_DELAYS_MS, timeoutMs = REQUEST_TIMEOUT_MS, fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
      let res;
      try {
        res = await fetchImpl(url, { ...init, signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
      if (!RETRYABLE_STATUS.has(res.status) || attempt === delays.length) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
      if (attempt === delays.length) throw new Error(`Billing Hub unreachable after ${attempt + 1} attempts: ${err?.message ?? err}`);
    }
    console.warn(`Billing Hub request failed (${lastError.message}); retry ${attempt + 1}/${delays.length} in ${delays[attempt] / 1000}s`);
    await sleep(delays[attempt]);
  }
  throw lastError;
}

