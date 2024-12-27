"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("./user.model");
const cloudinary_1 = __importDefault(require("cloudinary"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const sendMail_1 = require("../auth/sendMail");
const documents_model_1 = require("./documents.model");
const personal_info_model_1 = require("./personal-info.model");
const professional_info_model_1 = require("./professional-info.model");
const waitlist_model_1 = require("./waitlist.model");
cloudinary_1.default.v2.config({
    cloud_name: config_1.default.cloudinary.cloud_name,
    api_key: config_1.default.cloudinary.api_key,
    api_secret: config_1.default.cloudinary.api_secret,
});
const joinWaitlist = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield waitlist_model_1.Waitlist.findOne({ email });
    if (existingUser) {
        throw new ApiError_1.default(500, 'You are already in the waitlist!');
    }
    const newUser = yield waitlist_model_1.Waitlist.create({ email });
    (0, sendMail_1.sendEmail)('mohammadjahid0007@gmail.com', 'Waitlist Update', `
      <div>
        <p>New user has joined the waitlist: <strong>${email}</strong></p>
        <p>Thank you</p>
      </div>
    `);
    return newUser;
});
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.User.isUserExist(user.email);
    if (existingUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User already exists');
    }
    const existingGoogleUser = yield user_model_1.User.isGoogleUser(user.email);
    if (existingGoogleUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User already exists with google!');
    }
    if (user.role === user_1.ENUM_USER_ROLE.PARTNER) {
        delete user.professionalInformation;
        delete user.documents;
    }
    const newUser = yield user_model_1.User.create(user);
    if (!newUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create user');
    }
    return newUser;
});
const updateUser = (payload, user
// file: any
) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOneAndUpdate({ email: user.email }, payload, {
        new: true,
    });
    return result;
});
const updateOrCreateUserPersonalInformation = (payload, user, file) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = user;
    const isPersonalInformationExist = yield personal_info_model_1.PersonalInfo.findOne({
        user: _id,
    });
    // console.log({ file, payload });
    if (file === null || file === void 0 ? void 0 : file.path) {
        const cloudRes = yield cloudinary_1.default.v2.uploader.upload(file.path);
        payload.image = cloudRes.secure_url;
    }
    let result;
    if (!isPersonalInformationExist) {
        result = yield personal_info_model_1.PersonalInfo.create(Object.assign({ user: _id }, payload));
    }
    result = yield personal_info_model_1.PersonalInfo.findOneAndUpdate({ user: _id }, { $set: payload }, { new: true });
    return result;
});
const updateOrCreateUserProfessionalInformation = (payload, user, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = user;
    const { certifications } = payload;
    const fileMap = {};
    if (files.length > 0) {
        for (const file of files) {
            const cloudRes = yield cloudinary_1.default.v2.uploader.upload(file.path);
            fileMap[file.originalname] = cloudRes.secure_url;
        }
    }
    // console.log('fileMap', fileMap, certifications);
    if (certifications &&
        certifications.length > 0 &&
        Object.keys(fileMap).length > 0) {
        const processedCertifications = certifications.map((cert) => {
            if (fileMap[cert.fileId]) {
                return Object.assign(Object.assign({}, cert), { certificateFile: fileMap[cert.fileId] });
            }
            return cert;
        });
        payload.certifications = processedCertifications;
    }
    const isProfessionalInformationExist = yield professional_info_model_1.ProfessionalInfo.findOne({
        user: _id,
    });
    let result;
    if (!isProfessionalInformationExist) {
        result = yield professional_info_model_1.ProfessionalInfo.create(Object.assign({ user: _id }, payload));
    }
    result = yield professional_info_model_1.ProfessionalInfo.findOneAndUpdate({ user: _id }, { $set: payload }, { new: true });
    return result;
});
const updateOrCreateUserDocuments = (user, files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { _id } = user;
    let fileMap = {};
    if ((_b = (_a = files === null || files === void 0 ? void 0 : files.certificate) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) {
        fileMap.certificate = files.certificate[0].path;
    }
    if ((_d = (_c = files === null || files === void 0 ? void 0 : files.resume) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path) {
        fileMap.resume = files.resume[0].path;
    }
    if ((_f = (_e = files === null || files === void 0 ? void 0 : files.governmentId) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path) {
        fileMap.governmentId = files.governmentId[0].path;
    }
    if (Object.keys(fileMap).length > 0) {
        for (const file of Object.keys(fileMap)) {
            const cloudRes = yield cloudinary_1.default.v2.uploader.upload(fileMap[file]);
            // console.log('cloudRes', cloudRes);
            fileMap[file] = cloudRes.secure_url;
        }
    }
    const isDocumentsExist = yield documents_model_1.Documents.findOne({ user: _id });
    let result;
    if (!isDocumentsExist) {
        result = yield documents_model_1.Documents.create(Object.assign({ user: _id }, fileMap));
    }
    if (Object.keys(payload).length > 0) {
        fileMap = payload;
    }
    // console.log('query', fileMap);
    result = yield documents_model_1.Documents.findOneAndUpdate({ user: _id }, { $set: fileMap }, { new: true });
    return result;
});
const getUserProfile = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.aggregate([
        {
            $match: {
                email: user.email,
                _id: new mongoose_1.default.Types.ObjectId(user._id),
            },
        },
        {
            $lookup: {
                from: 'personalinformations',
                localField: '_id',
                foreignField: 'user',
                as: 'personalInfo',
            },
        },
        {
            $lookup: {
                from: 'professionalinformations',
                localField: '_id',
                foreignField: 'user',
                as: 'professionalInfo',
            },
        },
        {
            $lookup: {
                from: 'documents',
                localField: '_id',
                foreignField: 'user',
                as: 'documents',
            },
        },
        {
            $project: {
                email: 1,
                name: 1,
                role: 1,
                phone: 1,
                coverImage: 1,
                createdAt: 1,
                updatedAt: 1,
                personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
                documents: { $arrayElemAt: ['$documents', 0] },
            },
        },
    ]);
    return result.length > 0 ? result[0] : null;
});
const getPros = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.aggregate([
        {
            $match: {
                role: user_1.ENUM_USER_ROLE.PRO,
            },
        },
        {
            $lookup: {
                from: 'personalinformations',
                localField: '_id',
                foreignField: 'user',
                as: 'personalInfo',
            },
        },
        {
            $lookup: {
                from: 'professionalinformations',
                localField: '_id',
                foreignField: 'user',
                as: 'professionalInfo',
            },
        },
        {
            $lookup: {
                from: 'documents',
                localField: '_id',
                foreignField: 'user',
                as: 'documents',
            },
        },
        {
            $project: {
                email: 1,
                name: 1,
                role: 1,
                phone: 1,
                coverImage: 1,
                createdAt: 1,
                updatedAt: 1,
                personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
                documents: { $arrayElemAt: ['$documents', 0] },
            },
        },
        {
            $match: {
                personalInfo: { $exists: true, $ne: null },
                professionalInfo: { $exists: true, $ne: null },
            },
        },
        {
            $sort: {
                createdAt: 1,
            },
        },
    ]);
    return result;
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User id is required');
    }
    const result = yield user_model_1.User.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: 'personalinformations',
                localField: '_id',
                foreignField: 'user',
                as: 'personalInfo',
            },
        },
        {
            $lookup: {
                from: 'professionalinformations',
                localField: '_id',
                foreignField: 'user',
                as: 'professionalInfo',
            },
        },
        {
            $lookup: {
                from: 'documents',
                localField: '_id',
                foreignField: 'user',
                as: 'documents',
            },
        },
        {
            $project: {
                email: 1,
                name: 1,
                role: 1,
                phone: 1,
                coverImage: 1,
                createdAt: 1,
                updatedAt: 1,
                personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
                documents: { $arrayElemAt: ['$documents', 0] },
            },
        },
    ]);
    return result.length > 0 ? result[0] : null;
});
const updateCoverImage = (id, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User id is required');
    }
    if (!(file === null || file === void 0 ? void 0 : file.path)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'File is required');
    }
    const cloudRes = yield cloudinary_1.default.v2.uploader.upload(file.path);
    const result = yield user_model_1.User.findByIdAndUpdate(id, { coverImage: cloudRes.secure_url }, { new: true });
    return result;
});
exports.UserService = {
    createUser,
    updateUser,
    getUserProfile,
    updateOrCreateUserPersonalInformation,
    updateOrCreateUserProfessionalInformation,
    updateOrCreateUserDocuments,
    getUserById,
    updateCoverImage,
    getPros,
    joinWaitlist,
};
