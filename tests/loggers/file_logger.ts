import { Rhum } from "../../deps.ts";
import { FileLogger } from "../../logger/file_logger.ts";

const file = "./tmp/file_logger_test.log";

Rhum.testPlan("file_logger.ts", () => {
  Rhum.testSuite("FileLogger", () => {
    Rhum.testCase(`writes file: ${file}`, () => {
      const fileLogger = new FileLogger(file);
      const decoder = new TextDecoder();

      fileLogger.write("This is cool!");
      const actual = decoder.decode(Deno.readFileSync(file));
      Rhum.asserts.assertEquals(actual, "This is cool!\n");
      Deno.removeSync("tmp", { recursive: true });
    });
  });
});

Rhum.run();
