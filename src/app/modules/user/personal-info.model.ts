/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const PersonalInfoSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    image: {
      type: String,
      default:
        'https://med.gov.bz/wp-content/uploads/2020/08/dummy-profile-pic.jpg',
    },
    bio: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
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

export const PersonalInfo = model<any>(
  'PersonalInformation',
  PersonalInfoSchema
);