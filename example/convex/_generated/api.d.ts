/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentDemo from "../agentDemo.js";
import type * as ai from "../ai.js";
import type * as http from "../http.js";
import type * as jev from "../jev.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentDemo: typeof agentDemo;
  ai: typeof ai;
  http: typeof http;
  jev: typeof jev;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  aiBudget: import("../../../src/component/_generated/component.js").ComponentApi<"aiBudget">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  evaluations: import("../evaluations/_generated/component.js").ComponentApi<"evaluations">;
};
