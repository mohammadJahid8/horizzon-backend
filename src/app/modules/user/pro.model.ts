/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const ProSchema = new Schema<any>(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    pro: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Pro = model<any>('Pro', ProSchema);
