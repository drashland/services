export class IndexService {
  protected index = "";

  /**
   * A property to separate indices with their associated values.
   */
  protected index_separator = "";

  /**
   * The lookup table that's used when an index is found in the index.
   */
  protected lookup_table: Map<unknown, unknown>;

  constructor(
    index: string,
    separator: string,
    lookupTable: Map<unknown, unknown>,
  ) {
    this.index = index;
    this.index_separator = separator;
    this.lookup_table = lookupTable;
  }
}
