/**
 * An interface that represents a result from an index search.
 *
 * result
 *     The item that was found in the index based on a specified search term.
 * index
 *     The index of the item in the lookup table.
 */
export interface ISearchResult {
  id: number;
  item: unknown;
  search_term: string;
  search_input: string;
}

export class IndexService {
  protected index = "";

  /**
   * A property to separate indices with their associated values.
   */
  protected index_separator = "__is__";

  /**
   * The lookup table that's used when an index is found in the index.
   */
  protected lookup_table: Map<unknown, unknown>;

  constructor(
    lookupTable: Map<unknown, unknown>,
  ) {
    this.lookup_table = lookupTable;
  }

  public addItem(searchTerm: string, value: unknown): void {
    const id = this.lookup_table.size;
    this.lookup_table.set(id, value);
    this.index +=
      `\n_start_${searchTerm}__is__${id}_stop_`;
  }

  /**
   * Get the index.
   *
   * @returns The index.
   */
  public getIndex(): string {
    return this.index;
  }

  /**
   * Get the position of an item in the index.
   *
   * @param searchInput - The term to search for. For example, if an item in the
   * index is _start_hello__is__0_stop_, then the search term can be "hello" and
   * it will find the posoition of that item in the index.
   *
   * @returns The position of the item in the index.
   */
  public getItemPosition(searchInput: string): number {
    searchInput = "_start_" + searchInput;
    return this.index.search(searchInput);
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
   * Get an item in the index given a search term.
   *
   * @param searchInput- The term to search for.
   *
   * @returns An array of index items that the search term matched.
   */
  public search(searchInput: string): ISearchResult[] {
    const results: ISearchResult[] = [];
    const position = this.getItemPosition(searchInput);

    if (position === -1) {
      throw new Error(`Search input '${searchInput}' did not return any results from the index.`);
    }

    let item = position > 1 ? this.index.substring(position - 1) : this.index;

    let indexItems = item.match(new RegExp(searchInput + ".+_stop_", "g"))

    if (indexItems) {
      let count = indexItems.length - 1;
      while (count >= 0) {
        const indexItem = indexItems[count].replace("_stop_", "");
        const data = indexItem.split(this.index_separator);
        const key = Number(data[1]);
        const ret: ISearchResult  = {
          id: key,
          item: this.lookup_table.get(key),
          search_term: data[0],
          search_input: searchInput,
        };
        results.push(ret);
        count -= 1;
      }
    }

    return results;
  }
}
