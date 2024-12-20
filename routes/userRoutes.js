import { registerUser, loginUser,logoutUser, getUserById, getAllUsers,refreshAccessToken, getUserInfo, updateUserProfile } from "../controllers/userController.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";


const userRouter=Router();


userRouter.route("/register").post(registerUser);
userRouter.route("/me").get(verifyJWT,getUserInfo);
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/user/:id").get(verifyJWT,getUserById);
userRouter.route("/all-users").get(verifyJWT,getAllUsers);
userRouter.route("/update-profile/:id").put(verifyJWT,updateUserProfile);

export default userRouter;