/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const DocumentsSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    certificate: {
      type: String,
    },
    resume: {
      type: String,
    },
    governmentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Documents = model<any>('Documents', DocumentsSchema);
