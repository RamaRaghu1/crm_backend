import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// console.log("_____________________", process.env.ACCESS_TOKEN_SECRET)

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken;

  // console.log("token", token)
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log("ghghg", decodedToken);
    // console.log("id", new mongoose.Types.ObjectId(decodedToken._id))
    const user = await User.findById(new mongoose.Types.ObjectId(decodedToken._id));
    // .select("-password -refreshToken")
    // console.log("user", user);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    // console.log("req__",req.user)
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
