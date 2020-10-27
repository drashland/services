import { IndexService } from "./index_service.ts";

let args = Deno.args.slice();

const numRequests = 100000000000;
const seconds = Number(args[1]);
let totalRequests = 0;
let numItems = Number(args[2]);

console.log(`Performing search with ${numberWithCommas(numItems)} item(s) for ${seconds}s.`);

if (args[0] === "map") {
  map(numItems);
  Deno.exit();
}

if (args[0] === "service") {
  service(numItems);
  Deno.exit();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - HELPERS ///////////////////////////////////////////////////////
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
  const now = performance.now();
  let i = 0;
  while (i < numRequests) {
    const pn = performance.now();
    process();
    totalRequests += 1;
    const pt = performance.now();
    numbers.push(pt - pn);
    const then = performance.now();
    if (((then + now) / 1000) >= seconds) {
      i = 0;
      break;
    }
    i++;
  }

  let total = 0;
  for(let i = 0; i < numbers.length; i++) {
      total += numbers[i];
  }

  let avg = total / numbers.length;

  console.log(`Searching took an avg of ${(avg / 1000).toFixed(5)}s using ${method}.`);
  console.log(`Req/sec: ${totalRequests / seconds}`);
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

// https://stackoverflow.com/questions/2901102
// /how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
