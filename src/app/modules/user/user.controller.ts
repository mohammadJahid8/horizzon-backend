import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from './user.interface';
import { UserService } from './user.service';

const createUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createUser(req.body);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Signup successful! Please login to continue.',
      data: result,
    });
  }
);

const updateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const data = JSON.parse(req.body.data || '{}');
    console.log('req.body.data', data, req.file);

    if (Object.keys(data).length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Data is required');
    }

    const result = await UserService.updateUser(
      data,
      req.user as Partial<IUser>
    );

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User profile updated successfully!',
      data: result,
    });
  }
);

const updateOrCreateUserPersonalInformation = catchAsync(
  async (req: Request, res: Response) => {
    const data = JSON.parse(req.body.data || '{}');

    const result = await UserService.updateOrCreateUserPersonalInformation(
      data,
      req.user as Partial<IUser>,
      req.file
    );

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User personal information updated successfully!',
      data: result,
    });
  }
);
const updateOrCreateUserProfessionalInformation = catchAsync(
  async (req: Request, res: Response) => {
    const data = JSON.parse(req.body.data || '{}');
    const files = req.files;

    const result = await UserService.updateOrCreateUserProfessionalInformation(
      data,
      req.user as Partial<IUser>,
      files
    );

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User professional information updated successfully!',
      data: result,
    });
  }
);
const updateOrCreateUserDocuments = catchAsync(
  async (req: Request, res: Response) => {
    const files = req.files;

    const result = await UserService.updateOrCreateUserDocuments(
      req.user as Partial<IUser>,
      files
    );

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User documents updated successfully!',
      data: result,
    });
  }
);

const getUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getUserProfile(req.user as Partial<IUser>);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User profile retrieved successfully!',
      data: result,
    });
  }
);

export const UserController = {
  createUser,
  updateUser,
  getUserProfile,
  updateOrCreateUserPersonalInformation,
  updateOrCreateUserProfessionalInformation,
  updateOrCreateUserDocuments,
};