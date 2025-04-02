import { Exclude, Expose } from "class-transformer";

/**
 * Data transfer object for director information in movie responses
 */
export class DirectorDto {
  /**
   * Unique identifier of the director
   * @example "507f1f77bcf86cd799439011"
   */
  @Expose()
  id!: string;

  /**
   * First name of the director
   * @example "Christopher"
   */
  @Expose()
  firstName!: string;

  /**
   * Last name of the director
   * @example "Nolan"
   */
  @Expose()
  secondName!: string;

  /**
   * Biography of the director
   * @example "Christopher Nolan is a British-American film director known for his cerebral films."
   */
  @Exclude()
  bio!: string;

  /**
   * Date of birth of the director
   * @example "1970-07-30T00:00:00.000Z"
   */
  @Exclude()
  birthDate!: Date;

  /**
   * Creation timestamp
   * @example "2023-01-15T08:30:00.000Z"
   */
  @Exclude()
  createdAt!: Date;

  /**
   * Last update timestamp
   * @example "2023-01-15T09:15:00.000Z"
   */
  @Exclude()
  updatedAt!: Date;
}
