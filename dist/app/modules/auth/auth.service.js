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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const user_model_1 = require("../user/user.model");
const sendResetMail_1 = require("./sendResetMail");
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, source } = payload;
    const isUserExist = yield user_model_1.User.isUserExist(email);
    if (isUserExist && source !== isUserExist.role) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `This account is associated with ${isUserExist.role}! Login as ${isUserExist.role} instead.`);
    }
    // console.log('🚀 ~ loginUser ~ isUserExist:', isUserExist);
    const isGoogleUser = yield user_model_1.User.isGoogleUser(payload.email);
    if (isGoogleUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your account is associated with google! Please use google login.');
    }
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    if (isUserExist.password &&
        !(yield user_model_1.User.isPasswordMatched(password, isUserExist.password))) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Password is incorrect');
    }
    //create access token & refresh token
    const { email: userEmail, role, _id } = isUserExist;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ email: userEmail, role, _id }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ email: userEmail, role, _id }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const loginWithGoogle = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, role, source } = payload;
    const isUserExist = yield user_model_1.User.isUserExist(email);
    console.log({ email, isUserExist });
    const isGoogleUser = yield user_model_1.User.isGoogleUser(email);
    if (isGoogleUser && source !== (isGoogleUser === null || isGoogleUser === void 0 ? void 0 : isGoogleUser.role)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `This account is associated with ${isGoogleUser === null || isGoogleUser === void 0 ? void 0 : isGoogleUser.role}! Login as ${isGoogleUser === null || isGoogleUser === void 0 ? void 0 : isGoogleUser.role} instead.`);
    }
    if (isUserExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User already exists with email!');
    }
    const { _id } = isUserExist;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ email, role, _id }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ email, role, _id }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    if (!isGoogleUser) {
        payload.isGoogleUser = true;
        yield user_model_1.User.create(payload);
    }
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    //verify token
    // invalid token - synchronous
    console.log('tokentokentoken', token);
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    const { email } = verifiedToken;
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    //generate new token
    const newAccessToken = jwtHelpers_1.jwtHelpers.createToken({
        email: isUserExist.email,
        role: isUserExist.role,
        _id: isUserExist._id,
    }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const newRefreshToken = jwtHelpers_1.jwtHelpers.createToken({
        email: isUserExist.email,
        role: isUserExist.role,
        _id: isUserExist._id,
    }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = payload;
    //alternative way
    const isUserExist = yield user_model_1.User.findOne({ id: user === null || user === void 0 ? void 0 : user.userId }).select('+password');
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    // checking old password
    if (isUserExist.password &&
        !(yield user_model_1.User.isPasswordMatched(oldPassword, isUserExist.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Old Password is incorrect');
    }
    // // hash password before saving
    // const newHashedPassword = await bcrypt.hash(
    //   newPassword,
    //   Number(config.bycrypt_salt_rounds)
    // );
    // const query = { id: user?.userId };
    // const updatedData = {
    //   password: newHashedPassword,  //
    //   needsPasswordChange: false,
    //   passwordChangedAt: new Date(), //
    // };
    // await User.findOneAndUpdate(query, updatedData);
    // data update
    isUserExist.password = newPassword;
    // updating using save()
    isUserExist.save();
});
const forgotPass = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isGoogleUser = yield user_model_1.User.isGoogleUser(payload.email);
    if (isGoogleUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'This user is associated with google! Please use google login.');
    }
    const user = yield user_model_1.User.findOne({ email: payload.email, isGoogleUser: false }, { email: 1, role: 1, name: 1, _id: 1 });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User does not exist!');
    }
    const passResetToken = yield jwtHelpers_1.jwtHelpers.createResetToken({ email: user.email, _id: user._id }, config_1.default.jwt.secret, '50m');
    const resetLink = config_1.default.resetlink + `?token=${passResetToken}`;
    yield (0, sendResetMail_1.sendEmail)(user.email, `
      <div>
        <p>Hi, ${user.name}</p>
        <p>Your password reset link: <a href=${resetLink}>Click Here</a></p>
        <p>Thank you</p>
      </div>
  `);
});
const resetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword, token } = payload;
    const user = yield user_model_1.User.findOne({ email }, { email: 1, _id: 1 });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User not found!');
    }
    console.log('token: ', token);
    const isVerified = yield jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
    if (!isVerified) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Unauthorized!');
    }
    const password = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bycrypt_salt_rounds));
    yield user_model_1.User.updateOne({ email }, { password });
});
exports.AuthService = {
    loginUser,
    loginWithGoogle,
    refreshToken,
    changePassword,
    forgotPass,
    resetPassword,
};
