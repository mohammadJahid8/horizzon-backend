/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const OfferSchema = new Schema<any>(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    pro: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    jobLink: {
      type: String,
    },
    documentsNeeded: [
      {
        title: {
          type: String,
        },
        status: {
          type: String,
          enum: ['pending', 'uploaded'],
          default: 'pending',
        },
        url: {
          type: String,
        },
      },
    ],
    partnerNotes: {
      type: String,
    },
    proNotes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Offer = model<any>('Offer', OfferSchema);
