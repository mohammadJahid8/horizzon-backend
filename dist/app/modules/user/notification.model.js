"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    message: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
