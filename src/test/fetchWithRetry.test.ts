import { beforeEach, describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs build script
import { fetchWithRetry, resetRetryBudgetForTests } from "../../scripts/fetch-with-retry.mjs";

const opts = (fetchImpl: () => Promise<Response>) => ({ delays: [1, 1, 1, 1], fetchImpl, sleep: async () => {} });

describe("fetchWithRetry", () => {
  beforeEach(() => resetRetryBudgetForTests());
  it("stops once the total retry budget is used", async () => {
    let t = 0;
    let n = 0;
    await expect(
      fetchWithRetry("x", {}, { delays: [1, 1, 1, 1], totalBudgetMs: 100, now: () => t, sleep: async () => { t += 60; }, fetchImpl: async () => { n++; return new Response("", { status: 503 }); } }),
    ).rejects.toThrow(/budget/);
    expect(n).toBe(2);
  });
  it("retries a 502 and returns the later success", async () => {
    let n = 0;
    const res = await fetchWithRetry("x", {}, opts(async () => new Response("", { status: ++n < 3 ? 502 : 200 })));
    expect(res.status).toBe(200);
    expect(n).toBe(3);
  });
  it("does not retry a 401", async () => {
    let n = 0;
    const res = await fetchWithRetry("x", {}, opts(async () => { n++; return new Response("", { status: 401 }); }));
    expect(res.status).toBe(401);
    expect(n).toBe(1);
  });
  it("gives up after 5 attempts on a persistent 504", async () => {
    let n = 0;
    const res = await fetchWithRetry("x", {}, opts(async () => { n++; return new Response("", { status: 504 }); }));
    expect(res.status).toBe(504);
    expect(n).toBe(5);
  });
  it("throws after 5 failed network attempts", async () => {
    let n = 0;
    await expect(fetchWithRetry("x", {}, opts(async () => { n++; throw new Error("timeout"); }))).rejects.toThrow(/5 attempts/);
    expect(n).toBe(5);
  });
});
