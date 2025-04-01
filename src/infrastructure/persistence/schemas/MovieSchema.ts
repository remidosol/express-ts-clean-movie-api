import { model, Schema, Types } from "mongoose";
import { commonSchemaOptions } from "../../../shared/utils";

const MovieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    imdbId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    director: {
      type: Types.ObjectId,
      ref: "Director",
      required: true,
    },
  },
  {
    ...commonSchemaOptions,
    collection: "movies",
  }
);

const MovieModel = model("Movie", MovieSchema);

export { MovieModel, MovieSchema };
