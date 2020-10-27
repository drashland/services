# Index

A service to help index items in a `Map` when regex patterns are used to match items in a `Map` -- resulting in faster lookup times than `Map.forEach()`.

_Note: Performance does not improve when regex patterns are taken out of the equation._

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
const lookupTable = new Map<number, string>();
const i = new IndexService(lookupTable);

i.addItem("hello" "hello value"); // Adds the item as [0, "hello"] in lookupTable; adds ["hello", 0] to the index
i.addItem("world", "world value"); // Adds the item as [1, "hello"] in lookupTable; adds ["world", 1] to the index

// Search the lookup table by specifying a "search input"
const result = i.search("hel") // returns [{ id: 1, item: "hello value", search_term: "hello", search_input: "hel" }]
const noResults = i.search("deet") // returns []
```

## How It Works

When the `IndexService` is instantiated, it stores the lookup table you provide to it as its `lookup_table` property. When you add items to your lookup table via `.addItem()`, the `IndexService`:

1. Adds the first argument you provide to `.addItem()` as a "search term" and an "ID" to its `index` property (a `Map` with search terms and IDs -- the IDs are mapped to items in the lookup table); and
2. Adds the second argument you provide to `.addItem()` to the lookup table.

The search term is what you can search for in the index. If your search term matches anything in the index, the `IndexService` will take the ID associated with that search term and use that ID to target an item in the lookup table.

For example, if you call `.addItem("hello", "world")`, the `index` property will become the following ...

```
["hello", 0]
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

... and they will all match `["hello", 0]` in the `index` `Map`. The ID in the `Map` (`0` in this case) is used to target the lookup table via `.get()` -- returning an item from the lookup table without having to iterate through the entire lookup table in case it has thousands of items. This makes it extremely fast when using regex patterns as keys in a `Map`.

## Guides

### Creating An Indexed Map

1. Instantiate the index service and pass in your lookup table (which is the service's term for a `Map`) that you want indexed.

```typescript
const lt = new Map<number, string>();
const i = new IndexService(lt);
```

2. Add items to your lookup table.

```typescript
i.addItem("hello", "world");
i.addItem("hello", "again");
i.addItem("test", "something");
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
//   1 => {
//     id: 1,
//     item: "again",
//     search_term: "hello",
//     search_input: "hel"
//   },
// }
```

## API

### Methods

#### .addItem(searchInput: string, item: unknown)

* Add an item to the index and lookup table.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.addItem("search term to use to find the item in the lookup table", "item to put in the lookup table");
    ````
#### .getIndex()

* Gets the index. The index is a string.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.addItem("hello", "world");
    i.getIndex(); // returns Map { 0 => "world" }
    ```

#### .search(searchInput: string)

* Search the index and get back an array of search results.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    
    i.addItem("hello", "world");
    i.addItem("hello", "again");
    i.addItem("tests", "something");
    
    i.search("hel"); // returns Map {
                     //   0 => {
                     //     id: 0,
                     //     item: "world",
                     //     search_term: "hello",
                     //     search_input: "hel"
                     //   },
                     //   1 => {
                     //     id: 1,
                     //     item: "again",
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
$ deno run -A index/benchmarks_app.ts map 10 1000000 && deno run -A index/benchmarks_app.ts service 10 1000000
```

```
Performing search with 1,000 item(s) for 10s.

Searching took an avg of 0.00006s using Map.forEach().
Req/sec: 12049.6

Searching took an avg of 0.00003s using IndexService.search().
Req/sec: 20477
```

```
Performing search with 10,000 item(s) for 10s.

Searching took an avg of 0.00056s using Map.forEach().
Req/sec: 1727.8

Searching took an avg of 0.00033s using IndexService.search().
Req/sec: 2897.2
```

```
Performing search with 100,000 item(s) for 10s.

Searching took an avg of 0.00417s using Map.forEach().
Req/sec: 233

Searching took an avg of 0.00322s using IndexService.search().
Req/sec: 305.7
```

```
Performing search with 1,000,000 item(s) for 10s.

Searching took an avg of 0.04415s using Map.forEach().
Req/sec: 17.4

Searching took an avg of 0.03270s using IndexService.search().
Req/sec: 27.9
```
