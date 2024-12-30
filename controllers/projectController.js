import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Project from "../models/projectModel.js";
import { v2 as cloudinary } from "cloudinary";
import ApiFeatures from "../utils/apiFeature.js";
import mongoose from "mongoose";
import { checkUserExistsById } from "./userController.js";
const createProject = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const projectLeader = req.user.id;

    const projectData = {
      ...data,
      projectLeader,
    };

    console.log("vfhjbghj", projectData);

    const project = await Project.create(projectData);

    return res
      .status(201)
      .json(new ApiResponse(201, project, "project created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
});

const getAllProjectsByDevId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // find specific developer project
    const projects = await Project.find({
      developers: id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, projects, "projects fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({});

    return res
      .status(200)
      .json(new ApiResponse(200, projects, "projects fetched succesffully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getAllTodoProjects = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const projects = await Project.find({ status: "Todo", developers: id });

    res
      .status(200)
      .json(new ApiResponse(200, projects, "projects fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getAllInprogressProjects = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const projects = await Project.find({ status: "Progress", developers: id });

    res
      .status(200)
      .json(new ApiResponse(200, projects, "projects fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getAllCompletedProjects = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const projects = await Project.find({
      status: "Completed",
      developers: id,
    });

    res
      .status(200)
      .json(new ApiResponse(200, projects, "projects fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getProjectById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const project = await Project.aggregate([
      {
        $match: {
          _id: objectId,
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'projectId',
          as: 'tasks',
        },
      },
      {
        $lookup: {
          from: 'users', 
          let: { developerIds: '$developers' }, 
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$developerIds'], 
                },
              },
            },
            {
              $project: {
                name: 1, 
                position: 1,
              },
            },
          ],
          as: 'developers',
        },
      }
      
    ]);
    
const projectData=project[0];
    res
      .status(200)
      .json(new ApiResponse(200 ,projectData,  "projects fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const removeAssignDeveloper=asyncHandler(async(req,res)=>{
const {id}=req.params;
const {devId}=req.body;
console.log("user____", devId)
const project= await checkProjectExists(id);
// console.log("_____________", project)
await checkProjectLeader(project.projectLeader, req.user.id);

const user = await checkUserExistsById(devId);
console.log("____________", user)
const updateProject = await Project.findOneAndUpdate(
  {
      _id: project.id,
  },
  {
      $pull: {
          developers: user.id,
      },
  },
  {new:true}
);

res.status(200).json(new ApiResponse(200,updateProject, "developer removed successfully"));
})

const updateProject=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  const {title, description, startDate, endDate, status, developers}=req.body;
  const project=await checkProjectExists(id);

  await checkProjectLeader(project.projectLeader, req.user.id);
const newProjectData={title, description, startDate, endDate, status, developers}

const updateProject=await Project.findByIdAndUpdate(id, )

})


 const deleteProject = asyncHandler(
  async (req, res) => {
      const {id } = req.params;
  
      const project = await checkProjectExists(id);

      // check project leader
      await checkProjectLeader(project.projectLeader, req.user.id);

      // delete project
      await project.deleteOne({ _id:id });

    res.status(200).json(new ApiResponse(200, "Project deleted successfully") )
  }
);

const checkAssignDeveloper = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const { projectId } = req.params;
  const project = await checkProjectExists(projectId);

  const assign = project.developers.includes(id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assign,
        "Already this project is assigned to the developr "
      )
    );
});



const checkProjectExists = async (
  projectId) => {
  try {
    console.log(projectId ,"_______")
    const project = await Project.findOne({ _id: projectId });

    
    if (!project) {
      throw new ApiError(400, "Project you are looking for does not exist!");
    }
    return project;
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
 
};
console.log(checkProjectExists('67693b9325f0809e67f6abc6'));

const checkProjectLeader = async (projectLeaderId, currentUserId) => {
  if (projectLeaderId != currentUserId) {
    throw new ApiError(
      400,
      "You don't have permission to access this resources!"
    );
  }
};

const checkProjectDeveloper = async (project, currentUserId) => {
  if (!project.developers.include(currentUserId)) {
    throw new ApiError(
      400,
      "You don't have permission to access this resources!"
    );
  }
};
export {
  createProject,
  checkProjectLeader,
  checkProjectExists,
  checkProjectDeveloper,
  getAllProjectsByDevId,
  getAllTodoProjects,
  getProjectById,
  getAllProjects,
  getAllCompletedProjects,
  getAllInprogressProjects,
  checkAssignDeveloper,
  removeAssignDeveloper,
  deleteProject
};
