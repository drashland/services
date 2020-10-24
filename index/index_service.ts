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

  public addItem(item: string):void {
    const id = this.lookup_table.size;
    this.lookup_table.set(id, item);
    this.index +=
      `:_start_${item}__is__${id}_stop_`;
  }

  public getIndex(): string {
    return this.index;
  }

  public getItemPosition(input: string): number {
    return this.index.search("_start_" + input);
  }

  public getItem(input: string): unknown {
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

    const match = item.replace(":", "").match(/.+?:/);
    if (match) {
      return match[0].replace(":", "");
    }

    throw new Error(`Item '${input}' could not be matched to an index.`);
  }

  protected findStartOfItem(backwardsCounts: number, position: number): string {
    return this.index.substring(position - backwardsCounts);
  }

  protected findStopOfItem(forwardCounts: number, position: number): string {
    return this.index.substring(position + forwardCounts);
  }
}
