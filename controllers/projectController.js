import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Project from "../models/projectModel.js";
import { v2 as cloudinary } from "cloudinary";
import ApiFeatures from "../utils/apiFeature.js";

const createProject=asyncHandler(async(req,res)=>{
   try{
    const data=req.body;
    const projectThumbnail=data.photo;
    
    if (projectThumbnail) {
        const photo = await cloudinary.uploader.upload(projectThumbnail, {
          folder: "projects",
        });
  
        data.photo = {
          public_id: photo.public_id,
          url: photo.secure_url,
        };
      }

      console.log("vfhjbghj",data)

      const project=await Project.create(data)

      return res
      .status(201)
      .json(new ApiResponse(201, project, "project created successfully"));
   }catch(error){
    console.log(error)
    throw new ApiError(500, error.message)
   }

})

const getAllProjectsByDevId=asyncHandler(async(req,res)=>{
    try{
      const {id}=req.body;

          // find specific developer project
          const projects = await Project.find({
            developers: id,
        })
          
            return res.status(200).json(new ApiResponse(200, projects, "projects fetched successfully"))

    }catch(error){
        throw new ApiError(500, error.message)
    }
})

const getAllProjects=asyncHandler(async(req,res)=>{
  try{
const projects=await Project.find({});

return res.status(200).json(new ApiResponse(200, projects, "projects fetched succesffully"))
  }catch(error){
    throw new ApiError(500, error.message)
  }
})

const getAllTodoProjects = asyncHandler(async (req, res) => {
  try {
const {id}=req.body;

   
    const projects=
     await Project.find({ status: "Todo", developers: id })
     
   
    res.status(200).json(new ApiResponse(200, projects, "projects fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message); 
  }
});

const getAllInprogressProjects=asyncHandler(async(req,res)=>{
  try {
    const {id}=req.body;
    
       
        const projects=
         await Project.find({ status: "Progress", developers: id })
         
       
        res.status(200).json(new ApiResponse(200, projects, "projects fetched successfully"));
      } catch (error) {
        throw new ApiError(500, error.message); 
      }
})

const getAllCompletedProjects=asyncHandler(async(req,res)=>{
  try {
    const {id}=req.body;
    
       
        const projects=
         await Project.find({ status: "Completed", developers: id })
         
       
        res.status(200).json(new ApiResponse(200, projects, "projects fetched successfully"));
      } catch (error) {
        throw new ApiError(500, error.message); 
      }
})

const getProjectById=asyncHandler(async(req,res)=>{
  try{
    const {id}=req.body;

  }catch(error){
    throw new ApiError(500,error.message)
  }
})


export {createProject,getAllProjectsByDevId,getAllTodoProjects,getAllProjects,getAllCompletedProjects,getAllInprogressProjects}