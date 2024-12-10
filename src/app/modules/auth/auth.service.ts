import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { User } from '../user/user.model';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { sendEmail } from './sendResetMail';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password, source } = payload;

  const isUserExist = await User.isUserExist(email);

  if (isUserExist && source !== isUserExist.role) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This account is associated with ${isUserExist.role}! Login as ${isUserExist.role} instead.`
    );
  }

  // console.log('🚀 ~ loginUser ~ isUserExist:', isUserExist);
  const isGoogleUser = await User.isGoogleUser(payload.email);

  if (isGoogleUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Your account is associated with google! Please use google login.'
    );
  }

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is incorrect');
  }

  //create access token & refresh token

  const { email: userEmail, role, _id } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { email: userEmail, role, _id },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { email: userEmail, role, _id },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const loginWithGoogle = async (
  payload: ILoginUser
): Promise<ILoginUserResponse> => {
  const { email, role, source } = payload;

  const isUserExist = await User.isUserExist(email);
  console.log({ email, isUserExist });

  const isGoogleUser = await User.isGoogleUser(email);

  if (isGoogleUser && source !== isGoogleUser?.role) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This account is associated with ${isGoogleUser?.role}! Login as ${isGoogleUser?.role} instead.`
    );
  }

  if (isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User already exists with email!'
    );
  }

  const { _id } = isUserExist;

  const accessToken = jwtHelpers.createToken(
    { email, role, _id },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { email, role, _id },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  if (!isGoogleUser) {
    payload.isGoogleUser = true;
    await User.create(payload);
  }

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  // invalid token - synchronous

  console.log('tokentokentoken', token);

  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { email } = verifiedToken;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }
  //generate new token

  const newAccessToken = jwtHelpers.createToken(
    {
      email: isUserExist.email,
      role: isUserExist.role,
      _id: isUserExist._id,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const newRefreshToken = jwtHelpers.createToken(
    {
      email: isUserExist.email,
      role: isUserExist.role,
      _id: isUserExist._id,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  //alternative way
  const isUserExist = await User.findOne({ id: user?.userId }).select(
    '+password'
  );

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // checking old password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is incorrect');
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
};

const forgotPass = async (payload: { email: string }) => {
  const isGoogleUser = await User.isGoogleUser(payload.email);

  if (isGoogleUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This user is associated with google! Please use google login.'
    );
  }

  const user = await User.findOne(
    { email: payload.email, isGoogleUser: false },
    { email: 1, role: 1, name: 1, _id: 1 }
  );

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
  }

  const passResetToken = await jwtHelpers.createResetToken(
    { email: user.email, _id: user._id },
    config.jwt.secret as string,
    '50m'
  );

  const resetLink: string = config.resetlink + `?token=${passResetToken}`;

  await sendEmail(
    user.email,
    `
      <div>
        <p>Hi, ${user.name}</p>
        <p>Your password reset link: <a href=${resetLink}>Click Here</a></p>
        <p>Thank you</p>
      </div>
  `
  );
};

const resetPassword = async (payload: {
  email: string;
  newPassword: string;
  token: string;
}) => {
  const { email, newPassword, token } = payload;
  const user = await User.findOne({ email }, { email: 1, _id: 1 });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
  }

  console.log('token: ', token);
  const isVerified = await jwtHelpers.verifyToken(
    token,
    config.jwt.secret as string
  );

  if (!isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unauthorized!');
  }

  const password = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  await User.updateOne({ email }, { password });
};

export const AuthService = {
  loginUser,
  loginWithGoogle,
  refreshToken,
  changePassword,
  forgotPass,
  resetPassword,
};
