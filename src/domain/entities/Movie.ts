import { Types } from "mongoose";
import { Director } from "./Director";

export interface Movie {
  id?: string;
  title: string;
  description: string;
  releaseDate: Date;
  genre: string;
  rating?: number;
  imdbId: string;
  director: Types.ObjectId | Director | string;
  createdAt: Date;
  updatedAt: Date;
}
