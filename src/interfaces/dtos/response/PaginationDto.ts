import { Expose } from "class-transformer";

/**
 * Data transfer object for pagination metadata
 */
export class PaginationDto {
  /**
   * Total number of records
   * @example 42
   */
  @Expose()
  total!: number;

  /**
   * Current page number
   * @example 2
   */
  @Expose()
  page!: number;

  /**
   * Number of records per page
   * @example 10
   */
  @Expose()
  limit!: number;

  /**
   * Total number of pages
   * @example 5
   */
  @Expose()
  pages!: number;
}
