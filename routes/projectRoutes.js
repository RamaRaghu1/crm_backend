import {Router} from "express";
import { assignDeveloper, createProject, deleteProject,  getAllProjects, getAllProjectsByDevId, getProjectById, removeAssignDeveloper } from "../controllers/projectController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";


const projectRoutes=Router();

projectRoutes.route("/create-project").post(verifyJWT ,createProject);
projectRoutes.route("/get-projects/:id").get(verifyJWT,getAllProjectsByDevId)
projectRoutes.route("/get-all-projects").get(verifyJWT,getAllProjects);
projectRoutes.route("/get-project/:id").get(verifyJWT, getProjectById);
projectRoutes.route("/remove-dev/:id").post(verifyJWT, removeAssignDeveloper);
projectRoutes.route("/add-dev/:id").post(verifyJWT, assignDeveloper);
projectRoutes.route("/delete-project/:id").post(verifyJWT, deleteProject)

export default projectRoutes;