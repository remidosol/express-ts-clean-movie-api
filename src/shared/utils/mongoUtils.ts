import { SchemaOptions } from "mongoose";

export const commonSchemaOptions: SchemaOptions = {
  id: true,
  toJSON: {
    virtuals: true,
    getters: true,
    aliases: false,
    flattenMaps: false,
    transform: (_doc, ret) => {
      // Remove _id field
      if (ret._id) {
        delete ret._id;
      }

      // Ensure id is first in the returned object
      const { id, ...otherProps } = ret;
      return { id, ...otherProps };
    },
  },
  toObject: {
    virtuals: true,
    aliases: false,
    getters: true,
    flattenMaps: false,
    transform: (_doc, ret) => {
      // Remove _id field
      if (ret._id) {
        delete ret._id;
      }

      // Ensure id is first in the returned object
      const { id, ...otherProps } = ret;
      return { id, ...otherProps };
    },
  },
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: true },
};
