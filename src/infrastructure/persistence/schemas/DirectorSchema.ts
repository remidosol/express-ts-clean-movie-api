import { model, Schema } from "mongoose";
import { commonSchemaOptions } from "../../../shared/utils";

const DirectorSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    secondName: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
  },
  {
    ...commonSchemaOptions,
    collection: "directors",
  }
);

const DirectorModel = model("Director", DirectorSchema);

export { DirectorModel, DirectorSchema };
