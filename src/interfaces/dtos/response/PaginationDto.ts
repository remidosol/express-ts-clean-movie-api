import { Expose } from "class-transformer";

/**
 * Data transfer object for pagination metadata
 */
export class PaginationDto {
  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  pages!: number;
}
