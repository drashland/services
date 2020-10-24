import { Rhum } from "../../deps.ts";
import { IndexService } from "../../index/index_service.ts";

const lookupTable: Map<number, string> = new Map();
const i = new IndexService(
  lookupTable,
);

// Add items to the index
i.addItem("ok");
i.addItem("hello");
i.addItem("world");
i.addItem("wtfBro");
i.addItem("idgaf");
i.addItem("skrrrt steak");

Rhum.testPlan(async () => {
  Rhum.testSuite("getIndex()", () => {
    Rhum.testCase("gets the index", () => {
      Rhum.asserts.assertEquals(
        i.getIndex(),
        ":_start_ok__is__0_stop_:_start_hello__is__1_stop_:_start_world__is__2_stop_:_start_wtfBro__is__3_stop_:_start_idgaf__is__4_stop_:_start_skrrrt steak__is__5_stop_",
      );
    });
  });

  Rhum.testSuite("getItemPosition()", () => {
    Rhum.testCase("can find the position of hello in the index", () => {
      const position = i.getItemPosition("hello");
      Rhum.asserts.assertEquals(
        position,
        24,
      );
    });
  });
});
