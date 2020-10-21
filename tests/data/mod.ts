import { assertions, asserts } from "./src/rhum_asserts.ts";
import type {
  ITestCase,
  ITestPlan,
  ITestPlanResults,
} from "./src/interfaces.ts";
import type { Constructor, Stubbed } from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";
import { green, red, yellow } from "https://deno.land/std@0.74.0/fmt/colors.ts";

export const version = "v0.0.0";

const encoder = new TextEncoder();

export type { Constructor, Stubbed } from "./src/types.ts";
export { MockBuilder } from "./src/mock_builder.ts";

