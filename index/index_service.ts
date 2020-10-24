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

  public getIndex(): string {
    return this.index;
  }

  public getItemPosition(input: string): number {
    const searchTerm = "_start_" + input;
    return this.index.search(searchTerm);
  }

  // public getIndexOfItem(input: string): number {
  //   const item = this.getItem(input);
  //   const split = item.split(this.index_separator);
  //   return split[1];
  // }

  public getItem(input: string): ISearchResult[] {
    const results: ISearchResult[] = [];
    const position = this.getItemPosition(input);

    if (position === -1) {
      throw new Error(`Item '${input}' does not exist in index.`);
    }

    let item = position > 1 ? this.index.substring(position - 1) : this.index;
    let found = false;
    let backwardsCounts = 1;
    do {
      if (
        item.charAt(0) != ":"
        && item.charAt(1) != "_"
        && item.charAt(2) != "s"
        && item.charAt(3) != "t"
        && item.charAt(4) != "a"
        && item.charAt(5) != "r"
        && item.charAt(6) != "t"
        && item.charAt(7) != "_"
         ) {
        item = this.findStartOfItem(backwardsCounts, position);
      } else {
        found = true;
      }
      backwardsCounts++;
    } while (found === false);

    // Produce a clean string without the _start_ and _stop_ markers
    const clean = item.replace(":", "");

    // Iterate through the results that matched the input and turn them into
    // ISearchResult objects
    let indexItems = clean.split(":");
    indexItems.forEach((item: string) => {
      const clean = item.replace(/_start_|_stop_/g, "");
      const data = clean.split(this.index_separator);
      const ret: ISearchResult  = {
        result: data[0],
        index: Number(data[1]),
      };
      results.push(ret);
    });

    return results;
  }

  protected findStartOfItem(backwardsCounts: number, position: number): string {
    return this.index.substring(position - backwardsCounts);
  }
}
