/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const CompanyInfoSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    bio: {
      type: String,
    },
    dateEstablished: {
      type: Date,
    },

    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const CompanyInfo = model<any>('CompanyInformation', CompanyInfoSchema);
