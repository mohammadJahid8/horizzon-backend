"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_controller_1 = require("./user.controller");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({});
const upload = (0, multer_1.default)({ storage });
router.post('/signup', user_controller_1.UserController.createUser);
router.patch('/personal-information', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), upload.single('image'), user_controller_1.UserController.updateOrCreateUserPersonalInformation);
router.patch('/professional-information', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), upload.array(`certifications`), user_controller_1.UserController.updateOrCreateUserProfessionalInformation);
router.patch('/documents', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
]), user_controller_1.UserController.updateOrCreateUserDocuments);
router.patch('/update', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), upload.single('image'), user_controller_1.UserController.updateUser);
router.get('/profile', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), user_controller_1.UserController.getUserProfile);
router.get('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), user_controller_1.UserController.getUserById);
router.patch('/cover-image', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PARTNER, user_1.ENUM_USER_ROLE.PRO), upload.single('coverImage'), user_controller_1.UserController.updateCoverImage);
exports.UserRoutes = router;
