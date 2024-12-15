"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Documents = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const DocumentsSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    certificate: {
        type: String || null,
    },
    resume: {
        type: String || null,
    },
    governmentId: {
        type: String || null,
    },
}, {
    timestamps: true,
});
exports.Documents = (0, mongoose_1.model)('Documents', DocumentsSchema);
