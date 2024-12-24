import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import Project from "../models/projectModel.js";
import { checkProjectExists, checkProjectLeader } from "./projectController.js";
import { checkUserExistsById } from "./userController.js";
import Task from "../models/taskModel.js";
export const createTask = asyncHandler(async (req, res) => {
 try{
  
    
    const { title, projectId, description, startDate, endDate, developer } = req.body;
  
    const project = await checkProjectExists(projectId);

    console.log("_____", project)
    await checkProjectLeader(project.projectLeader, req.user.id);
    const user = await checkUserExistsById(req.user.id);
  
    const task = await Task.create({
      title,
      description,
      startDate,
      endDate,
      developer,
      assignedBy:req.user.id,
      projectId: project.projectId,
    });
  
    res.status(201).json(new ApiResponse(201, task, "Task assigned successfully"));
 }catch(error){
    console.log("_________________",error)
    throw new ApiError(500,error.message);
 }
});

export const changeTaskStatus= asyncHandler(async(req,res)=>{
const {taskId, status}=req.body;
await checkTaskDeveloper(taskId, req.user.id);

await checkProjectLeader(projectId




    
)
})


