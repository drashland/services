import { Rhum } from "../deps.ts";
import { FileLogger } from "../../loggers/file_logger.ts";

const file = "file_logger_test.log";

Rhum.testPlan("File Logger", () => {
  Rhum.testSuite("write()", () => {
    Rhum.testCase(`writes to a file: ${file}`, () => {
      const fileLogger = new FileLogger(file);
      const decoder = new TextDecoder();

      fileLogger.write("This is cool!");
      const actual = decoder.decode(Deno.readFileSync(file));
      Rhum.asserts.assertEquals(actual, "This is cool!\n");
      Deno.removeSync(file, { recursive: true });
    });
  });
});

Rhum.run();
