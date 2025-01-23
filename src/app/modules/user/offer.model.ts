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
    notes: [
      {
        role: {
          type: String,
          enum: ['partner', 'pro'],
        },
        note: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'responded'],
      default: 'pending',
    },
    isRemovedByPro: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Offer = model<any>('Offer', OfferSchema);
