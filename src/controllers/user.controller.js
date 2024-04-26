import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// registering the user
const registerUser = asyncHandler(async (req, res) => {
  // get user details from the client
  const { username, email, fullName, password } = req.body;
  // const { avatar, coverImage } = req.files;

  // validate if the data is not empty
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if the data already exist in db - with email & username
  const existedUser = await User.findOne({
    // 'or' operator ease the task of finding with multiple values
    $or: [{ username }, { email }],
  });

  // console.log(existedUser.username);

  if (existedUser) {
    throw new ApiError(409, "Email or username already exist!");
  }

  // check if images & avatar is available and storing temporarily in local server then uploading to cloudinary
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required!");
  }

  // uploading to cloudinary
  const avatarCloudinaryPath = await uploadOnCloudinary(avatarLocalPath);
  const coverImageCloudinaryPath =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarCloudinaryPath) {
    throw new ApiError(400, "Avatar image is required!");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatarCloudinaryPath.url,
    coverImage: coverImageCloudinaryPath?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // ensuring the user is created and then removing the password and refreshToken field from the response from db
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return response if user is created || error
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

// logging in the user
const loginUser = asyncHandler(async (req, res) => {
  // get the user data (req body -> data)
  // check if the data is validated
  // find the user
  // password check
  // generate access token and refresh token
  // send cookie

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // take the user from req and validate it with db
  // delete access and refresh token from db
  // delete cookie

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, loginUser, logoutUser };
