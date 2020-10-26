import { IndexService } from "./index_service.ts";

const numRequests = 1000;

interface SearchResult {
  id: number;
  item: string;
  search_input: string;
  search_term: RegExp | string;
}

function benchmark(
  numItems: number,
  process: () => void,
  method: string,
): void {
  const pn = performance.now();
  for (let i = 0; i < numRequests; i++) {
    process();
  }
  const pt = performance.now();
  if ((pt - pn) > 1000) {
    console.log(
      numItems + " items processed in " + ((pt - pn)/1000).toFixed(3) + "s by " +
        method,
    );
  } else {
    console.log(
      numItems + " items processed in " + (pt - pn).toFixed(3) + "ms by " +
        method,
    );
  }
}

function map(numItems: number): void {
  const m = new Map<string, SearchResult>();

  for (let i = 0; i < numItems; i++) {
    m.set(i.toString(), {
      id: i,
      item: i.toString() + "value",
      search_term: new RegExp(i.toString(), "g"),
      search_input: i.toString(),
    });
  }

  m.set("last item", {
    id: m.size + 1,
    item: "test value",
    search_term: "/test/g",
    search_input: "test",
  });

  const results: SearchResult[] = [];
  benchmark(numItems, () => {
    m.forEach((item: SearchResult) => {
      if (results.length > 0) {
        return;
      }
      if ("test".match(item.search_term)) {
        results.push(item);
      }
    });
  }, "Map.forEach()");
}

function service(numItems: number): void {
  const lt = new Map<number, string>();
  const s = new IndexService(lt);

  for (let i = 0; i < numItems; i++) {
    s.addItem(i.toString(), i.toString());
  }

  s.addItem("last item", "last item value");

  benchmark(numItems, () => {
    s.search("last");
  }, "IndexService.search()");
}

////////////////////////////////////////////////////////////////////////////////
// RUN THE BENCHMARKS //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

map(1);
service(1);
console.log();

map(1000);
service(1000);
console.log();

map(10000);
service(10000);
console.log();

map(20000);
service(20000);
console.log();

map(30000);
service(30000);
console.log();

map(40000);
service(40000);
console.log();

map(50000);
service(50000);
console.log();

map(60000);
service(60000);
console.log();

map(70000);
service(70000);
console.log();

map(80000);
service(80000);
console.log();

map(90000);
service(90000);
console.log();

map(100000);
service(100000);
console.log();

map(1000000);
service(1000000);
