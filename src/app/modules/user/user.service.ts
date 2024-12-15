import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';

import { IUser } from './user.interface';
import { User } from './user.model';

import cloudinary from 'cloudinary';
import mongoose from 'mongoose';
import config from '../../../config';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { Documents } from './documents.model';
import { PersonalInfo } from './personal-info.model';
import { ProfessionalInfo } from './professional-info.model';
cloudinary.v2.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const createUser = async (user: Partial<IUser>): Promise<IUser | null> => {
  const existingUser = await User.isUserExist(user.email as string);
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const existingGoogleUser = await User.isGoogleUser(user.email as string);
  if (existingGoogleUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User already exists with google!'
    );
  }

  if (user.role === ENUM_USER_ROLE.PARTNER) {
    delete user.professionalInformation;
    delete user.documents;
  }

  const newUser = await User.create(user);

  if (!newUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create user');
  }

  return newUser;
};

const updateUser = async (
  payload: Partial<IUser>,
  user: Partial<IUser>
  // file: any
): Promise<IUser | null> => {
  const result = await User.findOneAndUpdate({ email: user.email }, payload, {
    new: true,
  });
  return result;
};
const updateOrCreateUserPersonalInformation = async (
  payload: Partial<IUser>,
  user: Partial<IUser>,
  file: any
): Promise<IUser | null> => {
  const { _id } = user;

  const isPersonalInformationExist = await PersonalInfo.findOne({
    user: _id,
  });

  if (file?.path) {
    const cloudRes = await cloudinary.v2.uploader.upload(file.path);
    payload.image = cloudRes.secure_url;
  }

  let result: any;

  if (!isPersonalInformationExist) {
    result = await PersonalInfo.create({ user: _id, ...payload });
  }

  result = await PersonalInfo.findOneAndUpdate(
    { user: _id },
    { $set: payload },
    { new: true }
  );

  return result;
};
const updateOrCreateUserProfessionalInformation = async (
  payload: any,
  user: Partial<IUser>,
  files: any
): Promise<any> => {
  const { _id } = user;
  // console.log({ _id, payload });

  const { certifications }: any = payload;

  const fileMap: any = {};

  if (files.length > 0) {
    for (const file of files) {
      const cloudRes = await cloudinary.v2.uploader.upload(file.path);

      fileMap[file.originalname] = cloudRes.secure_url;
    }
  }

  console.log('fileMap', fileMap, certifications);

  if (
    certifications &&
    certifications.length > 0 &&
    Object.keys(fileMap).length > 0
  ) {
    const processedCertifications = certifications.map((cert: any) => {
      if (fileMap[cert.fileId]) {
        return {
          ...cert,
          certificateFile: fileMap[cert.fileId],
        };
      }
      return cert;
    });

    payload.certifications = processedCertifications;
  }

  const isProfessionalInformationExist = await ProfessionalInfo.findOne({
    user: _id,
  });

  let result: any;

  if (!isProfessionalInformationExist) {
    result = await ProfessionalInfo.create({ user: _id, ...payload });
  }

  result = await ProfessionalInfo.findOneAndUpdate(
    { user: _id },
    { $set: payload },
    { new: true }
  );
  return result;
};
const updateOrCreateUserDocuments = async (
  user: Partial<IUser>,
  files: any,
  payload: any
): Promise<any> => {
  const { _id } = user;

  let fileMap: any = {};

  if (files?.certificate?.[0]?.path) {
    fileMap.certificate = files.certificate[0].path;
  }
  if (files?.resume?.[0]?.path) {
    fileMap.resume = files.resume[0].path;
  }
  if (files?.governmentId?.[0]?.path) {
    fileMap.governmentId = files.governmentId[0].path;
  }

  if (Object.keys(fileMap).length > 0) {
    for (const file of Object.keys(fileMap)) {
      const cloudRes = await cloudinary.v2.uploader.upload(fileMap[file]);
      console.log('cloudRes', cloudRes);
      fileMap[file] = cloudRes.secure_url;
    }
  }

  const isDocumentsExist = await Documents.findOne({ user: _id });

  let result: any;

  if (!isDocumentsExist) {
    result = await Documents.create({ user: _id, ...fileMap });
  }

  if (Object.keys(payload).length > 0) {
    fileMap = payload;
  }

  console.log('query', fileMap);

  result = await Documents.findOneAndUpdate(
    { user: _id },
    { $set: fileMap },
    { new: true }
  );

  return result;
};

const getUserProfile = async (user: Partial<IUser>): Promise<IUser | null> => {
  const result = await User.aggregate([
    {
      $match: {
        email: user.email,
        _id: new mongoose.Types.ObjectId(user._id),
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
        createdAt: 1,
        updatedAt: 1,
        personalInfo: { $arrayElemAt: ['$personalInfo', 0] },
        professionalInfo: { $arrayElemAt: ['$professionalInfo', 0] },
        documents: { $arrayElemAt: ['$documents', 0] },
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
};

export const UserService = {
  createUser,
  updateUser,
  getUserProfile,
  updateOrCreateUserPersonalInformation,
  updateOrCreateUserProfessionalInformation,
  updateOrCreateUserDocuments,
};
