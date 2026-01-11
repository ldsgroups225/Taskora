/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLog from "../activityLog.js";
import type * as agents from "../agents.js";
import type * as ai from "../ai.js";
import type * as aql from "../aql.js";
import type * as auth from "../auth.js";
import type * as board from "../board.js";
import type * as capacity from "../capacity.js";
import type * as comments from "../comments.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as deliverables from "../deliverables.js";
import type * as issues from "../issues.js";
import type * as metrics from "../metrics.js";
import type * as postFunctions from "../postFunctions.js";
import type * as projects from "../projects.js";
import type * as reprioritization from "../reprioritization.js";
import type * as search from "../search.js";
import type * as test_utils from "../test_utils.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLog: typeof activityLog;
  agents: typeof agents;
  ai: typeof ai;
  aql: typeof aql;
  auth: typeof auth;
  board: typeof board;
  capacity: typeof capacity;
  comments: typeof comments;
  constants: typeof constants;
  crons: typeof crons;
  deliverables: typeof deliverables;
  issues: typeof issues;
  metrics: typeof metrics;
  postFunctions: typeof postFunctions;
  projects: typeof projects;
  reprioritization: typeof reprioritization;
  search: typeof search;
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
