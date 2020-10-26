import { Rhum } from "../../deps.ts";
import { IndexService } from "../../index/index_service.ts";

const lookupTable: Map<number, string> = new Map();
const i = new IndexService(
  lookupTable,
);

// Add items to the index
i.addItem("ok", "ok value");
i.addItem("hello1", "hello value 1");
i.addItem("hello2", "hello value 2");
i.addItem("world", "world value");
i.addItem("skrrrt", "skrrrt steak value");

Rhum.testPlan(async () => {
  Rhum.testSuite("addItem()", () => {
    Rhum.testCase("adds an item to the index and lookup table", () => {
      i.addItem("test", "test value");
      Rhum.asserts.assertEquals(
        i.search("tes"),
        [
          {
            id: 5,
            item: "test value",
            search_term: "test",
            search_input: "tes",
          },
        ],
      );
    });
  });

  Rhum.testSuite("getIndex()", () => {
    Rhum.testCase("returns the index", () => {
      Rhum.asserts.assertEquals(
        i.getIndex(),
        "\n_start_ok__is__0_stop_\n_start_hello1__is__1_stop_\n_start_hello2__is__2_stop_\n_start_world__is__3_stop_\n_start_skrrrt__is__4_stop_\n_start_test__is__5_stop_",
      );
    });
  });

  Rhum.testSuite("getSeparator()", () => {
    Rhum.testCase("returns the separator between a search term and an id", () => {
      Rhum.asserts.assertEquals(
        i.getSeparator(),
        "__is__"
      );
    });
  });

  Rhum.testSuite("search()", () => {
    Rhum.testCase("returns search results", () => {
      Rhum.asserts.assertEquals(
        i.search("hello"),
        [
          {
            id: 2,
            item: "hello value 2",
            search_term: "hello2",
            search_input: "hello",
          },
          {
            id: 1,
            item: "hello value 1",
            search_term: "hello1",
            search_input: "hello",
          },
        ],
      );
    });

    Rhum.testCase("returns 0 search results", () => {
      Rhum.asserts.assertEquals(
        i.search("deet"),
        [],
      );
    });
  });
});
