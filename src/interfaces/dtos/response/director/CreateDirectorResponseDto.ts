import { Expose, Type } from "class-transformer";
import { DirectorDto } from "./DirectorDto";

/**
 * Data transfer object for movie creation response
 */
export class CreateDirectorResponseDto {
  /**
   * Created director data
   * @example {"id":"507f1f77bcf86cd799439012","firstName":"Martin","secondName":"Scorsese"}
   */
  @Expose()
  @Type(() => DirectorDto)
  data!: DirectorDto;
}
