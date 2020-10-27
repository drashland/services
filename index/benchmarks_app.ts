import { IndexService } from "./index_service.ts";

const numRequests = 1;

performSearch(1);
performSearch(500);
performSearch(1000);
performSearch(5000);
performSearch(10000);
performSearch(50000);
performSearch(100000);
performSearch(500000);
performSearch(1000000);

////////////////////////////////////////////////////////////////////////////////

interface SearchResult {
  id: number;
  item: string;
  search_input: string;
  search_term: RegExp | string;
}

function benchmark(
  process: () => void,
  method: string,
): void {
  const numbers: number[] = [];
  for (let i = 0; i < numRequests; i++) {
    const pn = performance.now();
    process();
    const pt = performance.now();
    numbers.push(pt - pn);
  }
  let total = 0;
  for(let i = 0; i < numbers.length; i++) {
      total += numbers[i];
  }
  let avg = total / numbers.length;
  console.log(`Searching took ${(avg / 1000).toFixed(5)}s using ${method}.`);
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
  benchmark(() => {
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

  benchmark(() => {
    s.search("last");
  }, "IndexService.search()");
}

function performSearch(numItems: number) {
  console.log(`Performing search with ${numberWithCommas(numItems)} item(s) in each Map.`);
  map(numItems);
  service(numItems);
  console.log();
}

// https://stackoverflow.com/questions/2901102
// /how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
