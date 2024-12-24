import { Router } from "express";
import { createTask } from "../controllers/taskController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const taskRouter=Router();
taskRouter.route("/create-task").post(verifyJWT,createTask);


export default taskRouter;