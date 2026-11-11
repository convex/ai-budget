/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      addCase: FunctionReference<
        "mutation",
        "internal",
        {
          expectedJson?: string;
          inputJson: string;
          key: string;
          runId: string;
          sourceId?: string;
        },
        string,
        Name
      >;
      completeRun: FunctionReference<
        "mutation",
        "internal",
        {
          error?: string;
          runId: string;
          status: "completed" | "failed" | "budget_exhausted";
          summaryJson?: string;
        },
        null,
        Name
      >;
      createRun: FunctionReference<
        "mutation",
        "internal",
        {
          budgetTagDimension?: string;
          configJson: string;
          kind: "matrix" | "judge" | "backtest" | "evolve";
        },
        string,
        Name
      >;
      getRun: FunctionReference<
        "query",
        "internal",
        { runId: string },
        {
          _creationTime: number;
          _id: string;
          budgetTagDimension?: string;
          completedAt?: number;
          configJson: string;
          error?: string;
          kind: "matrix" | "judge" | "backtest" | "evolve";
          status: "running" | "completed" | "failed" | "budget_exhausted";
          summaryJson?: string;
        } | null,
        Name
      >;
      listCases: FunctionReference<
        "query",
        "internal",
        { limit?: number; runId: string },
        Array<{
          _creationTime: number;
          _id: string;
          expectedJson?: string;
          inputJson: string;
          key: string;
          runId: string;
          sourceId?: string;
        }>,
        Name
      >;
      listResults: FunctionReference<
        "query",
        "internal",
        { limit?: number; runId: string },
        Array<{
          _creationTime: number;
          _id: string;
          candidate: string;
          caseId?: string;
          costNanos: number;
          error?: string;
          model?: string;
          outputJson?: string;
          rationale?: string;
          runId: string;
          score?: number;
          verdict?: string;
        }>,
        Name
      >;
      listRuns: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        Array<{
          _creationTime: number;
          _id: string;
          budgetTagDimension?: string;
          completedAt?: number;
          configJson: string;
          error?: string;
          kind: "matrix" | "judge" | "backtest" | "evolve";
          status: "running" | "completed" | "failed" | "budget_exhausted";
          summaryJson?: string;
        }>,
        Name
      >;
      recordResult: FunctionReference<
        "mutation",
        "internal",
        {
          candidate: string;
          caseId?: string;
          costNanos: number;
          error?: string;
          model?: string;
          outputJson?: string;
          rationale?: string;
          runId: string;
          score?: number;
          verdict?: string;
        },
        string,
        Name
      >;
    };
  };
