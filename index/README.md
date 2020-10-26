# Index

A service to help index items in a `Map` -- resulting faster lookup times.

## Table of Contents

* [Quick Start](#quick-start)
* [How It Works](#how-it-works)
* [Guides](#guides)
    * [Indexing A Map](#indexing-a-map)
* [API](#api)
    * [Methods](#methods)
    * [Interfaces](#interfaces)

## Quick Start

```typescript
const lookupTable = new Map<number, string>();
const i = new IndexService(lookupTable);

i.addItem("hello" "hello value"); // Adds the item as [0, "hello"] in lookupTable; adds hello__is__0 to the index
i.addItem("world", "world value"); // Adds the item as [1, "hello"] in lookupTable; adds world__is__1 to the index

// Search the lookup table by specifying a "search input"
const result = i.search("hel") // returns [{ id: 1, item: "hello value", search_term: "hello", search_input: "hel" }]
const noResults = i.search("deet") // returns []
```

## How It Works

When the `IndexService` is instantiated, it stores the lookup table you provide to it as its `lookup_table` property. When you add items to your lookup table via `.addItem()`, the `IndexService`:

1. Appends a string associating a "search term" and "ID" to its `index` property; and
2. Adds the item to the lookup table.

The search term is what you can search for in the index. If your search term matches anything in the index, the `IndexService` will parse the matches and return an array of search results.

For example, if you call `.addItem("hello", "world")`, the `index` property will become the following:

```
_start_hello__is__0_stop__
```

This string is called an "item" in the index. It has start and stop markers, so the parsing logic knows where an item in the index begins and where an item ends -- essentially being able to differentiate items in a long string.

Also, when you call `.addItem("hello", "world")`, it will add `[0, "world"]` to the lookup table. This means you can search for the following ...

```
h
he
hel
hell
hello
```

... and they will all match `_start_hello__is__0_stop_` in the `index` string. This string is then parsed to split the search term from the ID -- resulting in `hello` and `0`. Once the split occurs, the ID is used to target the lookup table via `.get()` -- returning an item from the lookup table without having to iterate through the entire lookup table in case it has thousands of items.

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
// outputs => [
//   {
//     id: 0,
//     item: "world",
//     search_term: "hello",
//     search_input: "hel"
//   },
//   {
//     id: 1,
//     item: "again",
//     search_term: "hello",
//     search_input: "hel"
//   },
// ]
```


## Methods

### .addItem(searchInput: string, item: unknown)

* Add an item to the index and lookup table.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.addItem("search term", "item to put in the lookup table");
    ````
### .getIndex()

* Gets the index. The index is a string.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.addItem("hello", "world");
    i.getIndex(); // returns "_start_hello__is__0_stop_"
    ```
    
### .getSeparator()

* Gets the separator used to separate search terms and IDs in the index.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    i.getSeparator(); // returns "__is__"
    ```

### .search(searchInput: string)

* Search the index and get back an array of search results.
* Example:
    ```typescript
    const i = new IndexService(lookupTable);
    
    i.addItem("hello", "world");
    i.addItem("hello", "again");
    i.addItem("tests", "something");
    
    i.search("hel"); // returns [
                     //   {
                     //     id: 0,
                     //     item: "world",
                     //     search_term: "hello",
                     //     search_input: "hel"
                     //   },
                     //   {
                     //     id: 1,
                     //     item: "again",
                     //     search_term: "hello",
                     //     search_input: "hel"
                     //   },
                     // ]
    ```

## Interfaces

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
