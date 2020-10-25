export interface ISearchResult {
  result: string;
  index: number;
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
      `:_start_${searchTerm}__is__${id}_stop_`;
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
   * Get an item in the index given a search term.
   *
   * @param input - The term to search for.
   *
   * @returns An array of index items that the search term matched.
   */
  public getItem(searchTerm: string): ISearchResult[] {
    const results: ISearchResult[] = [];
    const position = this.getItemPosition(searchTerm);

    if (position === -1) {
      throw new Error(`Item '${searchTerm}' does not exist in index.`);
    }

    let item = position > 1 ? this.index.substring(position - 1) : this.index;

    // Produce a clean string without the _start_ and _stop_ markers
    const clean = item.replace(":", "");

    // Iterate through the results that matched the `searchTerm` and turn them
    // into ISearchResult objects
    let indexItems = clean.split(":");

    let count = indexItems.length - 1;
    while (count >= 0) {
      const indexItem = indexItems[count];
      const clean = indexItem.replace(/_start_|_stop_/g, "");
      const data = clean.split(this.index_separator);
      const ret: ISearchResult  = {
        result: data[0],
        index: Number(data[1]),
      };
      results.push(ret);
      count -= 1;
    }

    return results;
  }

  /**
   * Get the position of an item in the index.
   *
   * @param searchTerm - The term to search for. For example, if an item in the
   * index is _start_hello__is__0_stop_, then the search term can be "hello" and
   * it will find the posoition of that item in the index.
   *
   * @returns The position of the item in the index.
   */
  public getItemPosition(searchTerm: string): number {
    searchTerm = "_start_" + searchTerm;
    return this.index.search(searchTerm);
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
   * Help find the starting position of an item in the index.
   */
  protected findStartOfItem(backwardsCounts: number, position: number): string {
    return this.index.substring(position - backwardsCounts);
  }
}
