# Index

A service to index items in a `Map` with search terms.

## Table of Contents

* [Quick Start](#quick-start)
* [How It Works](#how-it-works)
* [Guides](#guides)
    * [Indexing A Map](#creating-an-indexed-map)
* [API](#api)
    * [Methods](#methods)
    * [Interfaces](#interfaces)
* [Benchmarks](#benchmarks)

## Quick Start

```typescript
import { IndexService } from "../index/index_service.ts";

const lookupTable = new Map<number, string>(); // The key MUST be the number type
const i = new IndexService(lookupTable);

i.addItem(["hello", "value"], "hello value");
i.addItem(["world", "value"], "world value");
console.log(i.getIndex());
// Oputputs
//
// Map {
//   "hello" => [ 0 ],
//   "value" => [ 0, 1 ],
//   "world" => [ 1 ]
// }

// Search the lookup table by specifying a "search input"
const helResults = i.search("hel");
console.log(helResults);
// Oputputs
//
// Map {
//   0 => {
//     id: 0,
//     item: "hello value",
//     search_term: "hello",
//     search_input: "hel"
//   }
// }
const valResults = i.search("val");
console.log(valResults);
// Oputputs
//
// Map {
//   0 => { id: 0, item: "hello value", search_term: "value", search_input: "val" },
//   1 => { id: 1, item: "world value", search_term: "value", search_input: "val" }
// }

```

## How It Works

When the `IndexService` is instantiated, it stores the lookup table you provide to it as its `lookup_table` property. When you add items to your lookup table via `.addItem()`, the `IndexService`:

1. Adds the first argument you provide to `.addItem()` as "search terms" and an "ID" to its `index` property (a `Map` with search terms and IDs -- the IDs are mapped to items in the lookup table); and
2. Adds the second argument you provide to `.addItem()` to the lookup table.

The search term is what you can search for in the index. If your search term matches anything in the index, the `IndexService` will take the IDs associated with the search term and use them to target items in the lookup table.

For example, if you call `.addItem(["hello"], "world")`, the `index` property will become the following ...

```
["hello", [0]]
```

... and the lookup table will become the following ...

```
[0, "world"]
```

This means you can search for the following strings ...

```
h
he
hel
hell
hello
```

... and they will all match `["hello", [0]]` in the `index` `Map`. The ID in the `Map` (`0` in this case) is used to target the lookup table via `.get()` -- returning an item from the lookup table without having to iterate through the entire lookup table in case it has millions of items.

You should note that each search is cached, so subsequent searches of the same search term are 2x (sometimes faster) faster than the first search.

## Guides

### Creating An Indexed Map

1. Instantiate the index service and pass in your lookup table (which is the service's term for a `Map`) that you want indexed.

```typescript
const lt = new Map<number, string>(); // Key MUST be the number type
const i = new IndexService(lt);
```

2. Add items to your lookup table.

```typescript
i.addItem(["hello"], "world");     // adds ["hello", [0]] to the index
i.addItem(["again aga"], "again"); // adds ["again", [1]] and ["aga", [1]] to the index
i.addItem(["hello"], "something"); // changes ["hello", [0]] to ["hello", [0,2]] in the index
```

3. Search your lookup table.

```typescript
const results = i.search("hel");

console.log(results);
// outputs => Map {
//   0 => {
//     id: 0,
//     item: "world",
//     search_term: "hello",
//     search_input: "hel"
//   },
//   2 => {
//     id: 2,
//     item: "something",
//     search_term: "hello",
//     search_input: "hel"
//   },
// }
```

## API

### Methods

#### .addItem(searchInput: string[], item: unknown)

* Add an item to the index and lookup table and make them searchable via search terms.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.addItem(["search", "terms"], {item to put into your lookup table});
    ````
#### .getIndex()

* Gets the index.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.addItem(["hello"], "world");
    i.getIndex(); // returns Map { "hello" => [0] }
    ```

#### .search(searchInput: string)

* Search the index and get search results.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    
    i.addItem(["hello"], "world");
    i.addItem(["hello"], "again");
    i.addItem(["tests"], "something");
    
    const results = i.search("hel");
    // Outputs
    //
    // Map {
    //   0 => {
    //     id: 0,
    //     item: "world",
    //     search_term: "hello",
    //     search_input: "hel"
    //   },
    //   2 => {
    //     id: 2,
    //     item: "something",
    //     search_term: "hello",
    //     search_input: "hel"
    //   },
    // }
    ```

### Interfaces

```typescript
/**
 * An interface that represents a result from an index search.
 *
 * id
 *     The index of the item in the lookup table.
 * item
 *     The item that matches the id in the lookup table.
 * search_input
 *     The input specified that returned this result.
 * search_term
 *     The term associated with the id in the index. This is the item that gets
 *     matched to the search input.
 */
export interface ISearchResult {
  id: number;
  item: unknown;
  search_input: string;
  search_term: string;
}
```

## Benchmarks

Benchmarks were run with a set number of items in each `Map`. The benchmarks application searched for the last item in each `Map` -- matching the item using regex. Below are the average times showing how long it took searches to complete and what method was used.

The below simulates a single request for a record in a `Map` (best out of 3 searches).

Command used:

```
$ deno run -A index/benchmarks_app.ts map 10 1000
$ deno run -A index/benchmarks_app.ts service 10 1000
$ deno run -A index/benchmarks_app.ts map 10 10000
$ deno run -A index/benchmarks_app.ts service 10 10000
$ deno run -A index/benchmarks_app.ts map 10 100000
$ deno run -A index/benchmarks_app.ts service 10 100000
$ deno run -A index/benchmarks_app.ts map 10 1000000
$ deno run -A index/benchmarks_app.ts service 10 1000000
```

```
Performing search with 1,000 item(s) for 10s.
Searching took an avg of 0.00006s using Map.forEach().
Searching took an avg of 0.00003s using IndexService.search().
```

```
Performing search with 10,000 item(s) for 10s.
Searching took an avg of 0.00056s using Map.forEach().
Searching took an avg of 0.00033s using IndexService.search().
```

```
Performing search with 100,000 item(s) for 10s.
Searching took an avg of 0.00417s using Map.forEach().
Searching took an avg of 0.00322s using IndexService.search().
```

```
Performing search with 1,000,000 item(s) for 10s.
Searching took an avg of 0.04415s using Map.forEach().
Searching took an avg of 0.03270s using IndexService.search().
```
