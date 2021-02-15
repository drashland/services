import { Rhum } from "https://raw.githubusercontent.com/drashland/rhum/rhum-cli/mod.ts";
import { MimeService } from "../../mime/mime_service.ts";

Rhum.testPlan(async () => {
  Rhum.testSuite("getMimeType()", () => {

    Rhum.testCase("returns the MIME type of a given file", () => {
      let mimeType: null | string;

      mimeType = MimeService.getMimeType("/hello/test.js");
      Rhum.asserts.assertEquals(mimeType, "application/javascript");

      mimeType = MimeService.getMimeType("http://test.js");
      Rhum.asserts.assertEquals(mimeType, "application/javascript");

      mimeType = MimeService.getMimeType("test.js");
      Rhum.asserts.assertEquals(mimeType, "application/javascript");
    });

    Rhum.testCase("returns null if the MIME type is unknown", () => {
      let mimeType: null | string;

      mimeType = MimeService.getMimeType("/hello/test.lordy");
      Rhum.asserts.assertEquals(mimeType, null);

      mimeType = MimeService.getMimeType("lordy");
      Rhum.asserts.assertEquals(mimeType, null);
    });
  });
});

