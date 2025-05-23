import { Types } from "mongoose";
import { Director } from "../../domain/entities";
import { CreateDirectorDto } from "../dtos/request/director";
import {
  CreateDirectorResponseDto,
  DirectorDto,
} from "../dtos/response/director";

export class DirectorMapper {
  /**
   * Maps a domain entity to a response DTO
   */
  static toDirectorDto(
    director: Director | Types.ObjectId | string
  ): DirectorDto {
    const dto = new DirectorDto();

    if (typeof director === "object" && "firstName" in director) {
      // It's a populated Director entity
      dto.id = director.id!;
      dto.firstName = director.firstName;
      dto.secondName = director.secondName;
      dto.bio = director.bio;
      dto.birthDate = director.birthDate;
      dto.createdAt = director.createdAt;
      dto.updatedAt = director.updatedAt;
    }

    return dto;
  }

  /**
   * Maps a create DTO to domain entity
   */
  static fromCreateDto(
    dto: CreateDirectorDto
  ): Omit<Director, "id" | "createdAt" | "updatedAt"> {
    return {
      firstName: dto.firstName,
      secondName: dto.secondName,
      bio: dto.bio,
      birthDate: dto.birthDate,
    };
  }

  /**
   * Maps a domain entity to a create response DTO
   */
  static toCreateDirectorResponseDto(
    director: DirectorDto
  ): CreateDirectorResponseDto {
    const responseDto = new CreateDirectorResponseDto();
    responseDto.data = director;
    return responseDto;
  }
}
