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
exports.UserController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const joinWaitlist = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.joinWaitlist(req.body.email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'You have been added to the waitlist!',
        data: result,
    });
}));
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.createUser(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Signup successful! Please login to continue.',
        data: result,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = JSON.parse(req.body.data || '{}');
    console.log('req.body.data', data, req.file);
    if (Object.keys(data).length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Data is required');
    }
    const result = yield user_service_1.UserService.updateUser(data, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile updated successfully!',
        data: result,
    });
}));
const updateOrCreateUserPersonalInformation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = JSON.parse(req.body.data || '{}');
    const result = yield user_service_1.UserService.updateOrCreateUserPersonalInformation(data, req.user, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User personal information updated successfully!',
        data: result,
    });
}));
const updateOrCreateUserProfessionalInformation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = JSON.parse(req.body.data || '{}');
    const files = req.files;
    const result = yield user_service_1.UserService.updateOrCreateUserProfessionalInformation(data, req.user, files);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User professional information updated successfully!',
        data: result,
    });
}));
const updateOrCreateUserDocuments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const payload = JSON.parse(req.body.data || '{}');
    const result = yield user_service_1.UserService.updateOrCreateUserDocuments(req.user, files, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User documents updated successfully!',
        data: result,
    });
}));
const getUserProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.getUserProfile(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile retrieved successfully!',
        data: result,
    });
}));
const getPros = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.getPros();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Pros retrieved successfully!',
        data: result,
    });
}));
const getUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.getUserById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile retrieved successfully!',
        data: result,
    });
}));
const updateCoverImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield user_service_1.UserService.updateCoverImage(user === null || user === void 0 ? void 0 : user._id, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User cover image updated successfully!',
        data: result,
    });
}));
exports.UserController = {
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
