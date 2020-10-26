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
const result = i.search("hel") // returns { id: 1, item: "hello value", search_term: "hello", search_input: "hel" }
```

## How It Works

## Guides

### Indexing A Map

## Interfaces

```typescript
/**
 * An interface that represents a result from an index search.
 *
 * result
 *     The item that was found in the index based on a specified search term.
 * index
 *     The index of the item in the lookup table.
 */
export interface ISearchResult {
  result: string;
  index: number;
}
```
