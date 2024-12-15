import { ENUM_USER_ROLE } from '../../../enums/user';

export type ILoginUser = {
  email: string;
  password: string;
  role?: ENUM_USER_ROLE;
  isGoogleUser?: boolean;
  source?: ENUM_USER_ROLE;
};

export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type IRefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type IVerifiedLoginUser = {
  userId: string;
  role: ENUM_USER_ROLE;
};

export type IChangePassword = {
  oldPassword: string;
  password: string;
};
