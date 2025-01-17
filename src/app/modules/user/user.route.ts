import express from 'express';
import multer from 'multer';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';
const router = express.Router();

const storage = multer.diskStorage({});

const upload = multer({ storage });

router.post('/signup', UserController.createUser);
router.post('/waitlist', UserController.joinWaitlist);

router.patch(
  '/personal-information',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  upload.single('image'),
  UserController.updateOrCreateUserPersonalInformation
);
router.patch(
  '/professional-information',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  upload.array(`certifications`),
  UserController.updateOrCreateUserProfessionalInformation
);
router.patch(
  '/documents',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
  ]),
  UserController.updateOrCreateUserDocuments
);
router.patch(
  '/update',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  upload.single('image'),
  UserController.updateUser
);

router.get(
  '/profile',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  UserController.getUserProfile
);

router.get(
  '/profile/:id',
  // auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  UserController.getUserById
);
router.get('/pros', auth(ENUM_USER_ROLE.PARTNER), UserController.getPros);

router.patch(
  '/cover-image',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  upload.single('coverImage'),
  UserController.updateCoverImage
);

router.post(
  '/offer',
  auth(ENUM_USER_ROLE.PARTNER),
  UserController.createOrUpdateOffer
);
router.get(
  '/offer',
  auth(ENUM_USER_ROLE.PARTNER, ENUM_USER_ROLE.PRO),
  UserController.getOffers
);
router.delete(
  '/offer/:id',
  auth(ENUM_USER_ROLE.PARTNER),
  UserController.deleteOffer
);

router.post(
  '/store-pro',
  auth(ENUM_USER_ROLE.PARTNER),
  UserController.storePro
);

export const UserRoutes = router;
