"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pro = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const ProSchema = new mongoose_1.Schema({
    partner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    pro: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
exports.Pro = (0, mongoose_1.model)('Pro', ProSchema);
