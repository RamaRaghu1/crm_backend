import { Router } from "express";
import { changeTaskStatus, createTask, getUserAllTask } from "../controllers/taskController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const taskRouter=Router();
taskRouter.route("/create-task").post(verifyJWT,createTask);
taskRouter.route("/change-status/:id").post(verifyJWT, changeTaskStatus)
taskRouter.route("/all-tasks").get(verifyJWT, getUserAllTask)


export default taskRouter;