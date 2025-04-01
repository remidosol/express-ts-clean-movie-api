import { Exclude, Expose } from "class-transformer";

/**
 * Data transfer object for director information in movie responses
 */
export class DirectorDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  secondName!: string;

  @Exclude()
  bio!: string;

  @Exclude()
  birthDate!: Date;

  @Exclude()
  createdAt!: Date;

  @Exclude()
  updatedAt!: Date;
}
