import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

const updateAttendance = asyncHandler(async (req, res, next) => {
  const { id, status, date } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid User ID"));
    }

  

    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
      return next(new ApiError(400, "Invalid or missing date"));
    }

    // Find the employee
    const employee = await User.findById(id);
    if (!employee) {
      return next(new ApiError(404, "Employee not found"));
    }

   
    const existingAttendanceIndex = employee.attendance.findIndex(
      (entry) => new Date(entry.date).toISOString().split('T')[0] === date
    );

    if (existingAttendanceIndex !== -1) {
  
      employee.attendance[existingAttendanceIndex].status = status;
    } else {
      // Add a new attendance entry
      employee.attendance.push({ status, date });
    }

    // Save the changes
    await employee.save();

    // Respond with success
    res.status(201).json(
      new ApiResponse(201, employee, "Attendance updated successfully")
    );
  } catch (err) {
    next(new ApiError(500, err.message));
  }
});

// get attendance data for particular date
const getAttendanceData=asyncHandler(async(req,res)=>{
  try{
const {date}=req.body;
console.log("Received date on backend:", date);

 const targetDate = new Date(date.date);


 console.log("Converted targetDate (time stripped):", targetDate);


 const employees = await User.aggregate([
   { $unwind: "$attendance" },  
   { $match: { "attendance.date": targetDate } },  
   { 
     $project: {
       _id: 1,
       employeeId: 1,
       name: 1,
       status: "$attendance.status",
       date: "$attendance.date"
     }
   }
 ]);
console.log(employees)
 res.status(201).json( new ApiResponse(201, employees, "Attendance data fetched successfully"));


  }catch(error){
    throw new ApiError(500, error.message);
  }
})



export {updateAttendance,getAttendanceData}