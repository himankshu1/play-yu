import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    console.log("request cookies :: ", req.cookies);
    const userAccessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log(userAccessToken);

    if (!userAccessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedUserAccessToken = jwt.verify(
      userAccessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedUserAccessToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
