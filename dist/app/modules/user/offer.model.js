"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const OfferSchema = new mongoose_1.Schema({
    partner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    pro: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    jobLink: {
        type: String || null,
    },
    documentsNeeded: [
        {
            title: {
                type: String,
            },
        },
    ],
    notes: {
        type: String || null,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});
exports.Offer = (0, mongoose_1.model)('Offer', OfferSchema);
