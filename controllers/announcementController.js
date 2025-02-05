import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Announcement from "../models/announcementModel.js";
import mongoose from "mongoose";


const addAnnouncement=asyncHandler(async(req,res, next)=>{
    try{
        const {title, content, date, author,priority}=req.body;
        if(!title || !content || !date|| !author|| !priority){
            return next(new ApiError(400, "All fields are required"))
        }
        const newAnnouncement=await Announcement.create({title, content, date, author,priority})
        return res
        .status(201)
        .json(new ApiResponse(201, newAnnouncement, "Announcement added successfully!"));
    }catch(error){
        throw new ApiError(400, error.message);
    }
})

const updateAnnouncement = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Holiday ID"));
    }
  
    try {
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedAnnouncement ) {
        return next(new ApiError(404, "Holiday not found"));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, updatedAnnouncement , "Holiday updated successfully!"));
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  });
  
  // Delete a holiday
  const deleteAnnouncement = asyncHandler(async (req, res, next) => {
    const {id} = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Holiday ID"));
    }
  
    try {
      const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
  
      if (!deletedAnnouncement) {
        return next(new ApiError(404, "Holiday not found"));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, deletedAnnouncement, "Holiday deleted successfully!"));
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  });

  const getAllAnnouncements = asyncHandler(async (req, res, next) => {
    try {
        const announcements = await Announcement.find();
        return res
            .status(200)
            .json(new ApiResponse(200, announcements, "Announcements fetched successfully!"));
    } catch (error) {
        next(new ApiError(500, error.message));
    }
});

const getAnnouncementById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return next(new ApiError(404, "Announcement not found"));
        }
        return res
            .status(200)
            .json(new ApiResponse(200, announcement, "Announcement fetched successfully!"));
    } catch (error) {
        next(new ApiError(500, error.message));
    }
});
  
  export {addAnnouncement, deleteAnnouncement, updateAnnouncement, getAllAnnouncements, getAnnouncementById};