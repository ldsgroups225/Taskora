/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as board from "../board.js";
import type * as crons from "../crons.js";
import type * as deliverables from "../deliverables.js";
import type * as issues from "../issues.js";
import type * as metrics from "../metrics.js";
import type * as projects from "../projects.js";
import type * as test_utils from "../test_utils.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  ai: typeof ai;
  auth: typeof auth;
  board: typeof board;
  crons: typeof crons;
  deliverables: typeof deliverables;
  issues: typeof issues;
  metrics: typeof metrics;
  projects: typeof projects;
  test_utils: typeof test_utils;
  users: typeof users;
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

export declare const components: {};
