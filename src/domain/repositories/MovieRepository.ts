import { Movie } from "../entities/Movie";

export interface FindAllMovieOptions {
  filters?: Partial<Movie>;
  pagination?: {
    page?: number;
    limit?: number;
  };
  sort?: { [key in keyof Movie]?: 1 | -1 };
  projection?: { [key in keyof Movie]?: 1 | 0 };
  populate?: any[];
}

export interface MovieRepository {
  findById(id: string): Promise<Movie | null>;
  findAll(params: FindAllMovieOptions): Promise<Movie[]>;
  getCount(filters?: Partial<Movie>): Promise<number>;
  findByDirector(directorId: string): Promise<Movie[]>;
  create(movie: Partial<Movie>): Promise<Movie>;
  update(id: string, movie: Partial<Movie>): Promise<Movie | null>;
  delete(id: string): Promise<boolean>;
}
