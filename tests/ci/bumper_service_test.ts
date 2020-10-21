import { Rhum } from "https://raw.githubusercontent.com/drashland/rhum/rhum-cli/mod.ts";
import { BumperService } from "../../ci/bumper_service.ts";

const b = new BumperService("rhum", []);
const c = new BumperService("rhum", ["--version=v1.2.3"]);

Rhum.testPlan(() => {
  Rhum.testSuite("constructor()", () => {
    Rhum.testCase("sets module_name", () => {
      Rhum.asserts.assertEquals(
        b.getModuleName(),
        "rhum",
      );
    });
    Rhum.testCase("sets parsed_args", () => {
      Rhum.asserts.assertEquals(
        b.getParsedArgs(),
        {},
      );
      Rhum.asserts.assertEquals(
        c.getParsedArgs(),
        {
          branch: "v1.2.3",
        },
      );
    });
    Rhum.testCase("sets is_for_pre_release", () => {
      Rhum.asserts.assertEquals(
        b.isForPreRelease(),
        false,
      );
      Rhum.asserts.assertEquals(
        c.isForPreRelease(),
        true,
      );
    });
    Rhum.testCase("sets latest_versions", async () => {
      const versions = {
        rhum: await c.getModulesLatestVersion("rhum"),
        deno: await c.getModulesLatestVersion("deno"),
        deno_std: await c.getModulesLatestVersion("std"),
      };
      Rhum.asserts.assertEquals(
        await c.getLatestVersions(),
        versions,
      );
    });
  });
});
