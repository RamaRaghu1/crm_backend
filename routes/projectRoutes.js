import {Router} from "express";
import { createProject, getAllCompletedProjects, getAllInprogressProjects, getAllProjects, getAllProjectsByDevId, getAllTodoProjects, getProjectById } from "../controllers/projectController.js";


const projectRoutes=Router();

projectRoutes.route("/create-project").post(createProject);
projectRoutes.route("/get-projects").get(getAllProjectsByDevId)
projectRoutes.route("/get-all-todo-projects").get(getAllTodoProjects);
projectRoutes.route("/get-all-inprogress-projects").get(getAllInprogressProjects);
projectRoutes.route("/get-all-completed-projects").get(getAllCompletedProjects);
projectRoutes.route("/get-all-projects").get(getAllProjects);
projectRoutes.route("/get-project/:id").get(getProjectById);
// projectRoutes.route()
export default projectRoutes;