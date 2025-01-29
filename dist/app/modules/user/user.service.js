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
const calculatePartnerPercentage_1 = require("../../../helpers/calculatePartnerPercentage");
const sendMail_1 = require("../auth/sendMail");
const documents_model_1 = require("./documents.model");
const notification_model_1 = require("./notification.model");
const offer_model_1 = require("./offer.model");
const personal_info_model_1 = require("./personal-info.model");
const pro_model_1 = require("./pro.model");
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
    yield (0, sendMail_1.sendEmail)('alfonza@joinhorizzon.com', 'Waitlist Update', `
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
    const { _id, role } = user;
    const personalInfo = yield personal_info_model_1.PersonalInfo.findOne({ user: _id });
    let completionPercentage = 0;
    if (role === user_1.ENUM_USER_ROLE.PRO) {
        const professionalInfo = yield professional_info_model_1.ProfessionalInfo.findOne({ user: _id });
        const documents = yield documents_model_1.Documents.findOne({ user: _id });
        const totalSteps = 3;
        const completedSteps = [
            Object.keys(personalInfo || {}).length > 0,
            Object.keys(professionalInfo || {}).length > 0,
            Object.keys(documents || {}).length > 0,
        ].filter(Boolean).length;
        completionPercentage = Math.floor((completedSteps / totalSteps) * 100);
    }
    if (role === user_1.ENUM_USER_ROLE.PARTNER) {
        const fields = [
            'image',
            'firstName',
            'lastName',
            'bio',
            'dateOfBirth',
            'companyName',
            'industry',
            'address',
        ];
        completionPercentage = (0, calculatePartnerPercentage_1.calculatePartnerPercentage)(fields, personalInfo);
    }
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
                role: 1,
                phone: 1,
                coverImage: 1,
                createdAt: 1,
                updatedAt: 1,
                personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
                documents: { $arrayElemAt: ['$documents', 0] },
                completionPercentage: {
                    $cond: {
                        if: {
                            $or: [
                                { $eq: [role, user_1.ENUM_USER_ROLE.PRO] },
                                { $eq: [role, user_1.ENUM_USER_ROLE.PARTNER] },
                            ],
                        },
                        then: completionPercentage,
                        else: 0,
                    },
                },
            },
        },
    ]);
    return result.length > 0 ? result[0] : null;
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
const createOrUpdateOffer = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Ensure the payload has the partner ID
    payload.partner = user._id;
    // Check if `payload.offer` exists to differentiate between update and create
    if (payload === null || payload === void 0 ? void 0 : payload.offer) {
        // Try updating the document
        const result = yield offer_model_1.Offer.findByIdAndUpdate(payload.offer, payload, {
            new: true, // Return the updated document
            upsert: true, // Create a new document if it doesn't exist
            setDefaultsOnInsert: true, // Ensure default values are set
        });
        return result;
    }
    else {
        // If no `offer` ID is provided, create a new document explicitly
        const newOffer = new offer_model_1.Offer(payload);
        const savedOffer = yield newOffer.save();
        return savedOffer;
    }
});
const getOffers = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_model_1.Offer.aggregate([
        {
            $match: Object.assign({ [user.role]: new mongoose_1.default.Types.ObjectId(user._id) }, (user.role === 'pro' ? { isRemovedByPro: { $ne: true } } : {})),
        },
        {
            $lookup: {
                from: 'users',
                localField: 'pro',
                foreignField: '_id',
                as: 'pro',
                pipeline: [
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
                        $addFields: {
                            personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                            professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
                            documents: { $arrayElemAt: ['$documents', 0] },
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'partner',
                foreignField: '_id',
                as: 'partner',
                pipeline: [
                    {
                        $lookup: {
                            from: 'personalinformations',
                            localField: '_id',
                            foreignField: 'user',
                            as: 'personalInfo',
                        },
                    },
                    {
                        $addFields: {
                            personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                pro: { $arrayElemAt: ['$pro', 0] },
                partner: { $arrayElemAt: ['$partner', 0] },
                notes: 1,
                documentsNeeded: 1,
                status: 1,
                jobLink: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);
    return result;
});
const deleteOffer = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_model_1.Offer.findByIdAndDelete(id);
    return result;
});
const updateOffer = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_model_1.Offer.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const updateOfferNotes = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_model_1.Offer.findByIdAndUpdate(id, { $push: { notes: payload } }, { new: true });
    return result;
});
const storePro = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { pro } = payload;
    const existingPro = yield pro_model_1.Pro.findOne({ partner: user._id, pro });
    if (existingPro) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Pro already exists');
    }
    const result = yield pro_model_1.Pro.create({ partner: user._id, pro });
    return result;
});
const getPros = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pro_model_1.Pro.aggregate([
        {
            $match: {
                partner: new mongoose_1.default.Types.ObjectId(user._id),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'pro',
                foreignField: '_id',
                as: 'pro',
                pipeline: [
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
                        $addFields: {
                            personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
                            professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
                            documents: { $arrayElemAt: ['$documents', 0] },
                        },
                    },
                    {
                        $match: user.role === 'pro' ? { isRemovedByPro: { $ne: true } } : {},
                    },
                    {
                        $project: {
                            password: 0,
                            isGoogleUser: 0,
                            canResetPassword: 0,
                            __v: 0,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 0,
                pro: 1,
            },
        },
        {
            $unwind: '$pro',
        },
    ]);
    return result.map(item => item.pro).reverse();
});
const uploadOfferDocuments = (files, id) => __awaiter(void 0, void 0, void 0, function* () {
    const fileMap = {};
    if (files.length > 0) {
        for (const file of files) {
            const cloudRes = yield cloudinary_1.default.v2.uploader.upload(file.path);
            fileMap[file.originalname] = cloudRes.secure_url;
        }
    }
    const offer = yield offer_model_1.Offer.findById(id);
    if (!offer) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Offer not found');
    }
    const documentsNeeded = offer.documentsNeeded;
    const documents = documentsNeeded.map((document) => {
        if (fileMap[document._id]) {
            return Object.assign(Object.assign({}, document), { url: fileMap[document._id], status: 'uploaded' });
        }
        return document;
    });
    offer.documentsNeeded = documents;
    offer.status = 'responded';
    yield offer.save();
    return offer;
});
const createNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.create(payload);
    const user = yield user_model_1.User.findById(payload.user);
    yield (0, sendMail_1.sendEmail)(user === null || user === void 0 ? void 0 : user.email, 'Notification', `
      <div>
        <p>New notification: <strong>${payload.message}</strong></p>
        <p>Thank you</p>
      </div>
    `);
    return result;
});
const getNotifications = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.find({ user: user._id }).sort({
        createdAt: -1,
    });
    return result;
});
const deleteNotification = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.findByIdAndDelete(id);
    return result;
});
const markAllNotificationsAsRead = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ user: user._id }, { $set: { isRead: true } });
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
    createOrUpdateOffer,
    getOffers,
    deleteOffer,
    storePro,
    uploadOfferDocuments,
    updateOffer,
    updateOfferNotes,
    createNotification,
    getNotifications,
    deleteNotification,
    markAllNotificationsAsRead,
};
