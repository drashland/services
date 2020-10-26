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
  Rhum.testSuite("search()", () => {
    Rhum.testCase("returns search results", () => {
      let item: string | unknown;

      item = i.search("hello");
      Rhum.asserts.assertEquals(
        item,
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
            search_input: "hello"
          },
        ]
      );
    });
  });
});
