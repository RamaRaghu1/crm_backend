import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import Project from "../models/projectModel.js";
import { checkProjectExists, checkProjectLeader } from "./projectController.js";
import { checkUserExistsById } from "./userController.js";
import Task from "../models/taskModel.js";
import mongoose from "mongoose";

export const createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description,projectId, startDate, endDate, developer } = req.body;
    // const { projectId } = req.params;
    const project = await checkProjectExists(
      new mongoose.Types.ObjectId(projectId)
    );

    // console.log("_____", project);
    await checkProjectLeader(project.projectLeader, req.user.id);
    const user = await checkUserExistsById(req.user.id);

    const task = await Task.create({
      title,
      description,
      startDate,
      endDate,
      developer,
      assignedBy: req.user.id,
      projectId: project._id,
    });

    res
      .status(201)
      .json(new ApiResponse(201, task, "Task assigned successfully"));
  } catch (error) {
    // console.log("_________________", error);
    throw new ApiError(500, error.message);
  }
});

export const changeTaskStatus = asyncHandler(async (req, res) => {
  try {
    const { taskId, status } = req.body;
    const { id } = req.params;
    await checkTaskExists(new mongoose.Types.ObjectId(taskId));
    const project = await checkProjectExists(new mongoose.Types.ObjectId(id));

    let hasPermission = false;

    try {
      await checkProjectLeader(project?.projectLeader, req.user.id);
      hasPermission = true;
    } catch (err) {
      // If not a leader, check if the user is the developer
      if (!hasPermission) {
        await checkTaskDeveloper(taskId, req.user.id);
        hasPermission = true;
      }
    }

    // If neither condition is true, throw an error
    if (!hasPermission) {
      throw new ApiError(
        403,
        "You don't have permission to change this task status!"
      );
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,

        $or: [
          {
            developer: req.user.id,
          },
          {
            assignedBy: req.user.id,
          },
        ],
      },
      {
        $set: {
          status,
        },
      }
    );

    res
      .status(201)
      .json(new ApiResponse(201, task, "Task status changed successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const getUserAllTask = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const tasks = await Task.find({ developer: id });
  res
    .status(200)
    .json(new ApiResponse(200, tasks, "tasks fetched successfully"));
});


export const getTaskDetails = asyncHandler(async (req, res) => {
      const { taskId } = req.body;

      // check task authorization -> project leader and developer
      const task = await checkTaskAuthorization(taskId, req.user.id);

    res.status(200).json(new ApiResponse(200, task, "task details fetched successfully"))
  }
);

export const checkTaskAuthorization = async (
  taskId,
  userId
) => {
  const { project, task } = await checkTaskExistsInProject(taskId);
  const currUser = await User.findOne({ _id: userId });
  // console.log("_________currUser_",currUser)
  if (task?.developer == userId || project.projectLeader == userId || currUser?.isSuperUser) {
      return task;
  } else {
    throw new ApiError(500, "You don't have permission to access this resources!")
  }
};

export const checkTaskExistsInProject = async (taskId) => {

  const task = await checkTaskExists(taskId);
// console.log("task_____________", task)
  
  const project = await checkProjectExists(task.projectId);
// console.log("project__________", project)


  // console.log(task?.projectId.toString() !== project._id.toString())
  if (task?.projectId.toString() !== project._id.toString()) {
    throw new ApiError(404, "Task does not exist in this project!");
  }

  return { project,task };
};



const checkTaskExists = async (id) => {
  const task = await Task.findOne({
    _id: id,
  });
  if (!task) {
    throw new ApiError(400, "task doesn't exist");
  }
  return task;
};
const checkTaskDeveloper = async (id, currUserId) => {
  const task = await checkTaskExists(id);

  // console.log("__________________", task);
  if (task.developer != currUserId) {
    throw new ApiError(400, "You don't have permission to access task!");
  }
};
// const task=async()=>{
//    const task = await Task.findOne(
//       {
//           _id:"676a783063c98ff50a3d24e0",

//           "$or": [{
//             developer: "675bfa5f4cbf73d899b5ac21",
//         }, {
//             assignedBy: "67594045e7f8f9fea5ef0c5a",
//         }]
//       },
//       // {
//       //     $set: {
//       //         status,
//       //     },
//       // }
//    );
// console.log(task)

// }

// task()
