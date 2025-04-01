import { FilterQuery, PopulateOptions, Types } from "mongoose";
import { inject, injectable, singleton } from "tsyringe";
import { Movie } from "../../domain/entities";
import {
  FindAllMovieOptions,
  MovieRepository,
} from "../../domain/repositories";
import { LOGGER, Logger } from "../logger/Logger";
import { MongoMovieMapper } from "../mappers";
import { MovieModel } from "../persistence/schemas";

/**
 * MongoMovieRepository is a concrete implementation of the MovieRepository interface
 * that interacts with a MongoDB database using Mongoose.
 */
@injectable()
@singleton()
export class MongoMovieRepository implements MovieRepository {
  constructor(@inject(LOGGER) private readonly logger: Logger) {
    logger.setOrganizationAndContext(MongoMovieRepository.name);
  }

  /**
   * Finds a movie by its unique identifier
   * @param id - The unique identifier of the movie
   * @returns A Promise that resolves to a Movie entity or null if not found
   */
  async findById(id: string): Promise<Movie | null> {
    try {
      const movie = await MovieModel.findById(id).populate("director").exec();

      if (!movie) return null;

      return MongoMovieMapper.toEntity(movie);
    } catch (error: any) {
      this.logger.error("Error in findById:", { error });
      return null;
    }
  }

  /**
   * Finds all movies matching the provided options
   * @param options - Object containing filter criteria, pagination settings, sort orders, projections, and population options
   * @returns A Promise that resolves to an array of Movie entities
   */
  async findAll({
    filters,
    pagination,
    sort,
    projection,
    populate,
  }: FindAllMovieOptions): Promise<Movie[]> {
    try {
      const query: FilterQuery<Movie> = {};
      const skip: number = pagination?.page
        ? (pagination.page - 1) * (pagination.limit || 10)
        : 0;
      const population: PopulateOptions[] | undefined = populate;

      if (filters) {
        if (filters.title)
          query.title = { $regex: filters.title, $options: "i" };
        if (filters.genre) query.genre = filters.genre;
        if (filters.rating) query.rating = filters.rating;
        if (filters.releaseDate) query.releaseDate = filters.releaseDate;
        if (filters.director && typeof filters.director === "string") {
          query.director = new Types.ObjectId(filters.director);
        }
      }

      const movies = await MovieModel.find(query, projection ?? {}, {
        skip,
        limit: pagination?.limit ?? 10,
        sort: sort ?? { createdAt: -1 },
        populate: population,
      }).exec();
      return movies.map((movie) => MongoMovieMapper.toEntity(movie));
    } catch (error: any) {
      this.logger.error("Error in findAll:", error);
      return [];
    }
  }

  /**
   * Gets the count of movies matching the provided filters
   * @param filters - Optional filter criteria to apply before counting
   * @returns A Promise that resolves to the number of matching movies
   */
  async getCount(filters?: Partial<Movie>): Promise<number> {
    try {
      const movieCount = await MovieModel.countDocuments(filters).exec();

      return movieCount;
    } catch (error: any) {
      this.logger.error("Error in findByDirector:", error);
      return 0;
    }
  }

  /**
   * Finds all movies associated with a specific director
   * @param directorId - The unique identifier of the director
   * @returns A Promise that resolves to an array of Movie entities
   */
  async findByDirector(directorId: string): Promise<Movie[]> {
    try {
      const movies = await MovieModel.find({
        director: new Types.ObjectId(directorId),
      }).populate("director");

      return movies.map((movie) => MongoMovieMapper.toEntity(movie));
    } catch (error: any) {
      this.logger.error("Error in findByDirector:", error);
      return [];
    }
  }

  /**
   * Creates a new movie in the database
   * @param movie - The partial movie entity to be created
   * @returns A Promise that resolves to the newly created Movie entity
   * @throws Will throw an error if the creation fails
   */
  async create(movie: Partial<Movie>): Promise<Movie> {
    try {
      const movieDocument = MongoMovieMapper.toDocument(movie);

      const newMovie = new MovieModel(movieDocument);
      const savedMovie = await newMovie.save();

      const populatedMovie = await savedMovie.populate("director");

      return MongoMovieMapper.toEntity(populatedMovie);
    } catch (error: any) {
      this.logger.error("Error in create:", error);
      throw error;
    }
  }

  /**
   * Updates an existing movie in the database
   * @param id - The unique identifier of the movie to update
   * @param movie - The partial movie entity with updated fields
   * @returns A Promise that resolves to the updated Movie entity or null if not found
   */
  async update(id: string, movie: Partial<Movie>): Promise<Movie | null> {
    try {
      // Remove id from update data if present
      const { id: _, ...updateData } = movie;

      // Handle director conversion if present
      if (updateData.director) {
        if (typeof updateData.director === "string") {
          updateData.director = new Types.ObjectId(updateData.director);
        } else if (updateData.director.id) {
          updateData.director = new Types.ObjectId(updateData.director.id);
        }
      }

      const updatedMovie = await MovieModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).populate("director");

      if (!updatedMovie) return null;

      return MongoMovieMapper.toEntity(updatedMovie);
    } catch (error: any) {
      this.logger.error("Error in update:", error);
      return null;
    }
  }

  /**
   * Deletes a movie from the database
   * @param id - The unique identifier of the movie to delete
   * @returns A Promise that resolves to a boolean indicating success (true) or failure (false)
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await MovieModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      this.logger.error("Error in delete:", error);
      return false;
    }
  }
}
