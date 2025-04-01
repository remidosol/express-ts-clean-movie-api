import { Types } from "mongoose";
import { Director } from "../../domain/entities/Director";
import { Movie } from "../../domain/entities/Movie";

export class MongoMovieMapper {
  /**
   * Convert a Mongoose document to a domain entity
   */
  static toEntity(document: any): Movie {
    // Check if document has populated director data or just an ObjectId
    const hasPopulatedDirector =
      document.director &&
      typeof document.director === "object" &&
      document.director.firstName !== undefined;

    return {
      id: document._id.toString(),
      title: document.title,
      description: document.description,
      releaseDate: document.releaseDate,
      genre: document.genre,
      rating: document.rating,
      imdbId: document.imdbId,
      director: hasPopulatedDirector
        ? {
            id: document.director._id.toString(),
            firstName: document.director.firstName,
            secondName: document.director.secondName,
            birthDate: document.director.birthDate,
            bio: document.director.bio,
            createdAt: document.director.createdAt,
            updatedAt: document.director.updatedAt,
          }
        : document.director, // Keep as ObjectId if not populated
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * Convert a domain entity to a MongoDB document
   */
  static toDocument(movie: Partial<Movie>): any {
    const document: any = {
      title: movie.title,
      description: movie.description,
      releaseDate: movie.releaseDate,
      genre: movie.genre,
      rating: movie.rating,
      imdbId: movie.imdbId,
    };

    // Handle director field based on its type
    if (movie.director) {
      if (movie.director instanceof Types.ObjectId) {
        document.director = movie.director;
      } else if (typeof movie.director === "string") {
        document.director = new Types.ObjectId(movie.director);
      } else if ((movie.director as Director).id) {
        document.director = new Types.ObjectId((movie.director as Director).id);
      }
    }

    // Include ID if it exists
    if (movie.id) {
      document._id = new Types.ObjectId(movie.id);
    }

    return document;
  }
}
