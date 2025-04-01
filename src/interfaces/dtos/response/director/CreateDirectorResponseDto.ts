import { Expose, Type } from "class-transformer";
import { DirectorDto } from "./DirectorDto";

/**
 * Data transfer object for movie creation response
 */
export class CreateDirectorResponseDto {
  @Expose()
  @Type(() => DirectorDto)
  data!: DirectorDto;
}
