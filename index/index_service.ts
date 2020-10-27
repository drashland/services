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

export class IndexService {
  protected index: Map<string, number> = new Map<string, number>();

  /**
   * A property to separate indices with their associated values.
   */
  protected index_separator = "__is__";

  /**
   * The lookup table that's used when an index is found in the index.
   */
  protected lookup_table: Map<number, unknown>;

  protected cache: Map<string, Map<number, ISearchResult>> = new Map<string, Map<number, ISearchResult>>();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    lookupTable: Map<number, unknown>,
  ) {
    this.lookup_table = lookupTable;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add an item to the index.
   *
   * @param searchTerm - The term to search for in order to find the item.
   * @param item - The item to add to the index.
   */
  public addItem(searchTerm: string, item: unknown): void {
    const id = this.lookup_table.size;
    this.lookup_table.set(id, item);
    this.index.set(searchTerm, id);
  }

  /**
   * Get the index.
   *
   * @returns The index.
   */
  public getIndex(): Map<string, number> {
    return this.index;
  }

  /**
   * Get the separator string that separates items in the index.
   *
   * @returns The separator.
   */
  public getSeparator(): string {
    return this.index_separator;
  }

  /**
   * Get an item in the index given a search input.
   *
   * @param searchInput- The term to search for.
   *
   * @returns An array of index items that the search input matched.
   */
  public search(searchInput: string): Map<number, ISearchResult> {
    if (this.cache.has(searchInput)) {
      const results = this.cache.get(searchInput);
      if (results) {
        return results;
      }
    }
    const results = new Map<number, ISearchResult>();
    this.index.forEach((id: number, key: string) => {
      if (key.includes(searchInput)) {
        results.set(id, {
          id: id,
          item: this.lookup_table.get(id),
          search_term: key,
          search_input: searchInput,
        });
      }
    });

    this.cache.set(searchInput, results);

    return results;
  }
}
