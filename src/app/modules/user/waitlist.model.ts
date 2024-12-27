/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const WaitlistSchema = new Schema<any>(
  {
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Waitlist = model<any>('Waitlist', WaitlistSchema);
