import { Rhum } from "../../deps.ts";
import { IndexService, ISearchResult } from "../../index/index_service.ts";

const lookupTable: Map<number, string> = new Map();
const i = new IndexService(
  lookupTable,
);

// Add items to the index
i.addItem(["ok"], "ok value");
i.addItem(["hello1"], "hello value 1-1");
i.addItem(["hello1"], "hello value 1-2");
i.addItem(["hello2"], "hello value 2");
i.addItem(["world"], "world value");
i.addItem(["skrrrt"], "skrrrt steak value");

Rhum.testPlan(async () => {
  Rhum.testSuite("addItem()", () => {
    Rhum.testCase("adds an item to the index and lookup table", () => {
      i.addItem(["test"], "test value");
      Rhum.asserts.assertEquals(
        i.search("tes"),
        new Map<number, ISearchResult>([
          [
            6,
            {
              id: 6,
              item: "test value",
              search_term: "test",
              search_input: "tes",
            },
          ],
        ]),
      );
    });
  });

  Rhum.testSuite("getIndex()", () => {
    Rhum.testCase("returns the index", () => {
      Rhum.asserts.assertEquals(
        i.getIndex(),
        new Map<string, number[]>([
          ["ok", [0]],
          ["hello1", [1, 2]],
          ["hello2", [3]],
          ["world", [4]],
          ["skrrrt", [5]],
          ["test", [6]],
        ]),
      );
    });
  });

  Rhum.testSuite("search()", () => {
    Rhum.testCase("returns search results", () => {
      Rhum.asserts.assertEquals(
        i.search("hello"),
        new Map<number, ISearchResult>([
          [
            1,
            {
              id: 1,
              item: "hello value 1-1",
              search_input: "hello",
              search_term: "hello1",
            },
          ],
          [
            2,
            {
              id: 2,
              item: "hello value 1-2",
              search_input: "hello",
              search_term: "hello1",
            },
          ],
          [
            3,
            {
              id: 3,
              item: "hello value 2",
              search_input: "hello",
              search_term: "hello2",
            },
          ],
        ]),
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
