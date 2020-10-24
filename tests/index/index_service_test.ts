import { Rhum } from "../../deps.ts";
import { IndexService } from "../../index/index_service.ts";

const lookupTable: Map<number, string> = new Map();
const i = new IndexService(
  lookupTable,
);

// Add items to the index
i.addItem("ok value");
i.addItem("hello value");
i.addItem("world value");
i.addItem("wtfBro value");
i.addItem("idgaf value");
i.addItem("skrrrt steak value");

Rhum.testPlan(async () => {
  Rhum.testSuite("getIndex()", () => {
    Rhum.testCase("gets the index", () => {
      Rhum.asserts.assertEquals(
        i.getIndex(),
        ":_start_ok value__is__0_stop_:_start_hello value__is__1_stop_:_start_world value__is__2_stop_:_start_wtfBro value__is__3_stop_:_start_idgaf value__is__4_stop_:_start_skrrrt steak value__is__5_stop_",
      );
    });
  });

  Rhum.testSuite("getItemPosition()", () => {
    Rhum.testCase("can find the position of an item in the index", () => {
      const position = i.getItemPosition("hello");
      Rhum.asserts.assertEquals(
        position,
        30,
      );
    });
  });

  Rhum.testSuite("getItem()", () => {
    Rhum.testCase("can get an item from the lookup table", () => {
      let item: string | unknown;

      item = i.getItem("hello");
      Rhum.asserts.assertEquals(
        item,
        "hello value__is__1",
      );

      Rhum.asserts.assertThrows(() => {
        item = i.getItem("wtfBrok");
      });

      item = i.getItem("wtfBro");
      Rhum.asserts.assertEquals(
        item,
        "wtfBro value__is__3",
      );
    });
  });
});
