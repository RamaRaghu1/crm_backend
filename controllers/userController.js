import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST , // Replace with your SMTP host
  port: process.env.EMAIL_PORT || 587,    
  service:process.env.SMTP_SERVICE,          // Replace with your SMTP port
  secure: false,                                    // Use true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,                  // Your email address
    pass: process.env.EMAIL_PASS,                  // Your email password
  },
});
// const generateAccessAndRefereshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     await User.findByIdAndUpdate(userId, { refreshToken });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(500, error.message);
//   }
// };

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const incomingRefreshToken = req.cookies.refreshToken;

//   if (!incomingRefreshToken) {
//     throw new ApiError(401, "unauthorized request");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token");
//     }

//     try {
//       if (incomingRefreshToken !== user?.refreshToken) {
//         throw new ApiError(401, "Refresh token is expired or used");
//       }
//     } catch (error) {
//       throw new ApiError(404, error.message);
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     };

//     const { accessToken, refreshToken: newRefreshToken } =
//       await generateAccessAndRefereshTokens(user._id);

//     res.cookie("accessToken", accessToken, options);
//     res.cookie("refreshToken", newRefreshToken, options);

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", newRefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           { accessToken, refreshToken: newRefreshToken },
//           "Access token refreshed"
//         )
//       );
//   } catch (error) {
//     throw new ApiError(401, error?.message);
//   }
// });

// register user
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    joiningDate,
    position,
    team,
    branch,
    isSuperUser,
    salary,
    address,
    emergencyContactNumber,
    emergencyContactName,
    emergencyContactRelation,
    employmentStatus,
    dateOfBirth,
    phone,
    gender,
  } = req.body;
  // console.log("_______", req.body);
  const userCount = await User.countDocuments();
  const employeeId = `KT${userCount + 1}`;

  if (
    [
      name,
      email,
      password,
      joiningDate,
      position,
      team,
      branch,
      isSuperUser,
      salary,
      address,
      emergencyContactNumber,
      emergencyContactName,
      emergencyContactRelation,
      employmentStatus,
      dateOfBirth,
      phone,
      gender,
    ].some((field) => field?.toString()?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  try {
    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      joiningDate,
      position,
      team,
      isSuperUser,
      branch,
      salary,
      emergencyContactNumber,
      emergencyContactName,
      emergencyContactRelation,
      employmentStatus,
      dateOfBirth,
      phone,
      address,
      gender,
    });

    const createdUser = await User.findById(user._id);

    if (!createdUser) {
      throw new ApiError(
        400,
        "Something went wrong while registering the user"
      );
    }
    await user.save();
    return res
      .status(201)
      .json(new ApiResponse(200, user, "User registered Successfully"));
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});
// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "All fields are required!");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "Invalid email or password");
  }

  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }

  // const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
  //   user._id
  // );
  const accessToken = user.generateAccessToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
    // domain:"http://localhost:5173/" // try "lax" or "strict" for testing
    // remove domain for local testing
  };

  res.cookie("accessToken", accessToken, options);
  // res.cookie("refreshToken", refreshToken, options);
  return (
    res
      .status(200)
      // .cookie("accessToken", accessToken
      //   // , options
      // )
      // .cookie("refreshToken", refreshToken
      //   // , options
      // )
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            // refreshToken,
          },
          "User logged In Successfully"
        )
      )
  );
});

const getUserInfo = asyncHandler(async (req, res) => {
  try {
    // Extract userId from the authenticated user (added via middleware)
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(
        400,
        "User ID is required or not found in the request"
      );
    }

    // Fetch user information from the database, excluding sensitive fields like password
    const user = await User.findById({ _id: userId }).select("-password");
    // console.log("______",user)
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Send back the user information
    res
      .status(200)
      .json(
        new ApiResponse(200, user, "User information retrieved successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: false, // set to false for local testing
    sameSite: "lax", // try "lax" or "strict" for testing
    // remove domain for local testing
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// get single user
const getUserById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }
  try {
    const user = await User.findById(id).select("-password -refreshToken");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User data fetched successfully!"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    // .select("-password -refreshToken");
    if (!users) {
      throw new ApiError(400, "something went wrong");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// edit employee

// const editEmployee = asyncHandler(async (req, res) => {
//   const { email, name, position, phone, address, team } = req.body;
//   const id = req.params.id;
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return next(new ApiError(400, "Invalid User ID"));
//   }
// });

const updateUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const data = req.body;
    // const avatar=data.image;
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // if (avatar && !avatar.startsWith("https")) {
    //   await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //   const myCloud = await cloudinary.v2.uploader.upload(avatar, {
    //     folder: "employees",
    //   });

    //   data.avatar = {
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //   };
    // }

    // if(avatar.startsWith("https")){
    //   data.avatar={
    //     public_id: user?.avatar.public_id,
    //     url:user?.avatar.url
    //   }
    // }
    // console.log("_______________", userId);

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: data });
    const InfoUser = await User.findById(userId);
    // console.log("updated", InfoUser);

    res
      .status(201)
      .json(new ApiResponse(201, InfoUser, "Profile updated succesfully!"));
  } catch (error) {
    console.error("Error updating profile:", error);
    next(new ApiError(500, error.message));
  }
});


const sendMail=asyncHandler(async(req,res,next)=>{

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'ramaraghunathan18@gmail.com', 
      to: to,
      subject: subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.response);
    res
    .status(200)
    .json(new ApiResponse(200, null, 'Email sent successfully.'));
   
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ApiError(404, error.message);
   
  }
})

// update user role
const updateUserRole = asyncHandler(async (req, res, next) => {
  try {
    const { email, isAdmin, isSuperUser } = req.body;
    const requestingUserId = req.user.id;

    // Check if the requesting user is an admin
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser || !requestingUser.isAdmin) {
      throw new ApiError(403, "Unauthorized: Admin access required");
    }

    // Check if the target user exists
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Update the target user's role
    targetUser.isAdmin = isAdmin;
    targetUser.isSuperUser=isSuperUser;
    await targetUser.save();

    res
      .status(200)
      .json(new ApiResponse(200, targetUser, "User role updated successfully!"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});


const checkUserExistsById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User you are looking for does not exist!");
  }
  return user;
};
export {
  loginUser,
  logoutUser,
  getUserInfo,
  updateUserProfile,
  registerUser,
  updateUserRole,
  getUserById,
  getAllUsers,
  sendMail,
  checkUserExistsById,
};
