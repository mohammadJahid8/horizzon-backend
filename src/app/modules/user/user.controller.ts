import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from './user.interface';
import { UserService } from './user.service';

const joinWaitlist: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.joinWaitlist(req.body.email);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'You have been added to the waitlist!',
      data: result,
    });
  }
);
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
    const payload = JSON.parse(req.body.data || '{}');

    const result = await UserService.updateOrCreateUserDocuments(
      req.user as Partial<IUser>,
      files,
      payload
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
const getPros: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getPros();

    sendResponse<IUser[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Pros retrieved successfully!',
      data: result,
    });
  }
);

const getUserById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    console.log('result', req.params.id);
    const result = await UserService.getUserById(req.params.id);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User profile retrieved successfully!',
      data: result,
    });
  }
);
const updateCoverImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await UserService.updateCoverImage(user?._id, req.file);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User cover image updated successfully!',
      data: result,
    });
  }
);

const createOffer: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createOffer(
      req.body,
      req.user as Partial<IUser>
    );

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Offer created successfully!',
      data: result,
    });
  }
);
const getOffers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getOffers(req.user as Partial<IUser>);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Offer created successfully!',
      data: result,
    });
  }
);
const deleteOffer: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.deleteOffer(req.params.id);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Offer deleted successfully!',
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
  getUserById,
  updateCoverImage,
  getPros,
  joinWaitlist,
  createOffer,
  getOffers,
  deleteOffer,
};
