import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Holiday from "../models/holidayModel.js";

const addHoliday = asyncHandler(async (req, res, next) => {
    try {
      const { name, type, date, description } = req.body;
  
      if (!name || !type || !date || !description) {
        return next(new ApiError(400, "All fields are required"));
      }
  
      const newHoliday = await Holiday.create({ name, type, date, description });
  
      return res
        .status(201)
        .json(new ApiResponse(201, newHoliday, "Holiday added successfully!"));
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  });
  
  // Edit a holiday
  const updateHoliday = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Holiday ID"));
    }
  
    try {
      const updatedHoliday = await Holiday.findByIdAndUpdate(
        id, 
        { $set: req.body }, // Directly use req.body
        { new: true, runValidators: true } // Return updated document & validate
      );

  
      if (!updatedHoliday) {
        return next(new ApiError(404, "Holiday not found"));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, updatedHoliday, "Holiday updated successfully!"));
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  });
  
  // Delete a holiday
  const deleteHoliday = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Holiday ID"));
    }
  
    try {
      const deletedHoliday = await Holiday.findByIdAndDelete(id);
  
      if (!deletedHoliday) {
        return next(new ApiError(404, "Holiday not found"));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, deletedHoliday, "Holiday deleted successfully!"));
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  });


  const getAllHolidays = asyncHandler(async (req, res, next) => {
    try {
        const holidays = await Holiday.find();
        return res
            .status(200)
            .json(new ApiResponse(200, holidays , "Holidays fetched successfully!"));
    } catch (error) {
        next(new ApiError(500, error.message));
    }
});

const getHolidayById = asyncHandler(async (req, res, next) => {
  try {
      const { id } = req.params;
      const holiday = await Holiday.findById(id);
      if (!holiday) {
          return next(new ApiError(404, "Holiday not found"));
      }
      return res
          .status(200)
          .json(new ApiResponse(200, holiday, "Holiday fetched successfully!"));
  } catch (error) {
      next(new ApiError(500, error.message));
  }
});
  
  export {addHoliday, updateHoliday, deleteHoliday, getAllHolidays, getHolidayById};