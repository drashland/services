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

}
