"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInfo = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const CompanyInfoSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.CompanyInfo = (0, mongoose_1.model)('CompanyInformation', CompanyInfoSchema);
