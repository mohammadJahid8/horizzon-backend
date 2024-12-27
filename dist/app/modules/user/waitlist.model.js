"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Waitlist = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const WaitlistSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
exports.Waitlist = (0, mongoose_1.model)('Waitlist', WaitlistSchema);
