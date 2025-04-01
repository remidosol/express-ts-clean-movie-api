import { Types } from "mongoose";
import { Director } from "../../domain/entities/Director";

export class MongoDirectorMapper {
  /**
   * Convert a Mongoose document to a domain entity
   */
  static toEntity(document: any): Director {
    return {
      id: document._id.toString(),
      firstName: document.firstName,
      secondName: document.secondName,
      birthDate: document.birthDate,
      bio: document.bio,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * Convert a domain entity to a MongoDB document
   */
  static toDocument(director: Partial<Director>): any {
    const document: any = {
      firstName: director.firstName,
      secondName: director.secondName,
      birthDate: director.birthDate,
      bio: director.bio,
    };

    // Include ID if it exists
    if (director.id) {
      document._id = new Types.ObjectId(director.id);
    }

    return document;
  }
}
