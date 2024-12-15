/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const DocumentsSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    certificate: {
      type: String || null,
    },
    resume: {
      type: String || null,
    },
    governmentId: {
      type: String || null,
    },
  },
  {
    timestamps: true,
  }
);

export const Documents = model<any>('Documents', DocumentsSchema);
