import rateLimiterTest from "@convex-dev/rate-limiter/test";
import shardedCounterTest from "@convex-dev/sharded-counter/test";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "!./**/*.test.ts",
  "!./**/convex.config.ts",
]);
const now = Date.UTC(2026, 0, 31, 23, 59, 59);
let t: ReturnType<typeof convexTest>;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  shardedCounterTest.register(t);
});
afterEach(async () => {
  await t.finishAllScheduledFunctions(vi.runAllTimers);
  vi.useRealTimers();
});
const start = (extra = {}) =>
  t.mutation(api.lib.startRequest, {
    userId: "u",
    model: "external/job",
    messages: [],
    estimatedCostNanos: 100,
    estimatedTokens: 0,
    ...extra,
  });
async function finish(requestId: any, extra = {}) {
  await t.mutation(api.lib.finishRequest, {
    requestId,
    costNanos: 100,
    ...extra,
  });
  await t.mutation(internal.lib.foldTotals, { requestId });
  await t.mutation(internal.lib.rollupPhase, {});
}
const history = (period: "day" | "month") =>
  t.query(api.lib.usageHistory, { dimension: "user", value: "u", period });

test("N2: settlement override, admission default, then processing time determine attribution", async () => {
  const admission = Date.UTC(2025, 11, 31, 23, 59, 59);
  const override = Date.UTC(2026, 0, 1);
  const a = await start({ occurredAt: admission });
  await finish(a.requestId);
  const b = await start({ occurredAt: admission });
  await finish(b.requestId, { occurredAt: override });
  const c = await start();
  await finish(c.requestId);
  expect(
    (await history("day")).map((r: any) => [r.stamp, r.spendNanos]),
  ).toEqual([
    ["2026-01-31", 100],
    ["2026-01-01", 100],
    ["2025-12-31", 100],
  ]);
  expect(
    (await t.query(api.lib.getRequest, { requestId: a.requestId })).finishedAt,
  ).toBe(now);
  expect(await t.query(api.lib.getGlobalStatus, {})).toMatchObject({
    spentTotalNanos: 300,
    spentTodayNanos: 100,
  });
});

test("S2: ordinary calls retain their original optional record shape", async () => {
  const r = await start();
  const pending = await t.query(api.lib.getRequest, { requestId: r.requestId });
  expect(pending).not.toHaveProperty("occurredAt");
  expect(pending).not.toHaveProperty("reservationPeriods");
  await finish(r.requestId);
  const done = await t.query(api.lib.getRequest, { requestId: r.requestId });
  const event = await t.query(api.lib.getBillingEvent, {
    requestId: r.requestId,
  });
  for (const record of [done, event]) {
    expect(record).not.toHaveProperty("occurredAt");
    expect(record).not.toHaveProperty("attributedPeriods");
  }
});

describe.each([false, true])(
  "B3: future timestamps with capped=%s",
  (capped) => {
    test.each([1_000, 28 * 86400_000])(
      "reject future attribution by %s ms and preserve current caps",
      async (offset) => {
        if (capped)
          await t.mutation(api.lib.setBucketLimits, {
            dimension: "user",
            value: "u",
            dailySpendLimitNanos: 1000,
            monthlySpendLimitNanos: 1000,
            dailyTokenLimit: 10,
            monthlyTokenLimit: 10,
          });
        const a = await start({ estimatedCostNanos: 500 });
        await finish(a.requestId, { costNanos: 500, promptTokens: 5 });
        await expect(start({ occurredAt: now + offset })).rejects.toThrow(
          /occurredAt/,
        );
        const b = await start();
        await expect(
          finish(b.requestId, { occurredAt: now + offset }),
        ).rejects.toThrow(/occurredAt/);
        expect(
          (await t.query(api.lib.getRequest, { requestId: b.requestId }))
            .status,
        ).toBe("pending");
        await finish(b.requestId, { costNanos: 0 });
        if (!capped)
          await t.mutation(api.lib.setBucketLimits, {
            dimension: "user",
            value: "u",
            dailySpendLimitNanos: 1000,
            monthlySpendLimitNanos: 1000,
          });
        expect((await start({ estimatedCostNanos: 600 })).allowed).toBe(false);
        expect(await t.query(api.lib.getGlobalStatus, {})).toMatchObject({
          spentTodayNanos: 500,
        });
        if (capped)
          expect(
            (await start({ estimatedCostNanos: 0, estimatedTokens: 6 }))
              .allowed,
          ).toBe(false);
      },
    );
  },
);

test("S3: reject extended years and invalid milliseconds at both boundaries", async () => {
  vi.setSystemTime(Date.UTC(10000, 0, 3));
  for (const occurredAt of [
    Date.UTC(10000, 0, 1),
    Date.UTC(-1, 11, 31),
    NaN,
    Infinity,
    0.5,
  ]) {
    await expect(start({ occurredAt })).rejects.toThrow(/occurredAt/);
    const r = await start();
    await expect(finish(r.requestId, { occurredAt })).rejects.toThrow(
      /occurredAt/,
    );
  }
});

test("supported four-digit year endpoints and midnight month boundaries stay distinct", async () => {
  vi.setSystemTime(253402300799999);
  for (const occurredAt of [
    -62167219200000,
    253402300799999,
    Date.UTC(2026, 0, 31, 23, 59, 59, 999),
    Date.UTC(2026, 1, 1),
  ]) {
    const r = await start({ occurredAt });
    await finish(r.requestId);
  }
  expect((await history("day")).map((r: any) => r.stamp)).toEqual([
    "9999-12-31",
    "2026-02-01",
    "2026-01-31",
    "0000-01-01",
  ]);
  expect((await history("month")).map((r: any) => r.stamp)).toEqual([
    "9999-12",
    "2026-02",
    "2026-01",
    "0000-01",
  ]);
});

test("B3: future settlement is rejected independently of admission defaults", async () => {
  const r = await start();
  await expect(finish(r.requestId, { occurredAt: now + 1 })).rejects.toThrow(
    /future/,
  );
  expect(
    (await t.query(api.lib.getRequest, { requestId: r.requestId })).status,
  ).toBe("pending");
});
