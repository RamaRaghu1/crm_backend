import { Router } from "express";
import { changeTaskStatus, createTask, getTaskDetails, getUserAllTask } from "../controllers/taskController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const taskRouter=Router();
taskRouter.route("/create-task").post(verifyJWT,createTask);
taskRouter.route("/change-status/:id").post(verifyJWT, changeTaskStatus)
taskRouter.route("/all-tasks").get(verifyJWT, getUserAllTask)
taskRouter.route("/task-details").get(verifyJWT, getTaskDetails)

export default taskRouter;