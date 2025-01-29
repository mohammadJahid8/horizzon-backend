/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<any>('Notification', NotificationSchema);
