import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Leave from "../models/leaveModel.js";

const applyForLeave = asyncHandler(async (req, res, next) => {
  const { uid, leaveDate, employeeName, employeeId } = req.body;

  // Validate User ID
  if (!uid) {
    return next(new ApiError(400, "User ID not provided"));
  }

  if (!mongoose.Types.ObjectId.isValid(uid)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  try {

    const startDate = new Date(leaveDate.startDate);
    const endDate = new Date(leaveDate.endDate);

    if (startDate > endDate) {
      return next(new ApiError(400, "Invalid start date or end date"));
    }

   
    let leaveDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
    );

    if (leaveDate.leaveDuration === "half-day") {
      leaveDays -= 0.5;
    }

  
    const currentMonthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const currentMonthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // console.log("month", currentMonthStart);
    // console.log("monthEnd", currentMonthEnd);
   
    const existingLeaves = await Leave.findOne({ id: uid });

    if (existingLeaves) {
      const leavesThisMonth = existingLeaves.leaveSets.filter(
        (leave) =>
          leave.startDate >= currentMonthStart &&
          leave.endDate <= currentMonthEnd
      );

   
      const sickLeaveDays = leavesThisMonth
        .filter((leave) => leave.leaveType === "sick-leave")
        .reduce((sum, leave) => sum + leave.leaveDays, 0);

  
      const casualLeaveDays = leavesThisMonth
        .filter((leave) => leave.leaveType === "casual-leave")
        .reduce((sum, leave) => sum + leave.leaveDays, 0);

        const unpaidLeaveDays = leavesThisMonth
      .filter((leave) => leave.leaveType === "unpaid-leave")
      .reduce((sum, leave) => sum + leave.leaveDays, 0);

      if (leaveDate.leaveType === "sick-leave" && sickLeaveDays + leaveDays > 3) {
        return next(
          new ApiError(
            400,
           "You can't take more than 3 sick leaves per month."
          
          )
        );
      }

      

      if (leaveDate.leaveType === "casual-leave" && casualLeaveDays + leaveDays > 2) {
        return next(
          new ApiError(
            400,
              "You can't take more than 2 casual leaves per month."
            
          )
        );
      }

      if (leaveDate.leaveType === "unpaid-leave" && unpaidLeaveDays + leaveDays > 6) {
        return next(
          new ApiError(
            400,
              "You can't take more than 6 lop per month."
            
          )
        );
      }
    }

    const leaveEntry = {
      startDate,
      endDate,
      leaveDays,
      leaveType: leaveDate.leaveType || "",
      leaveReason: leaveDate.leaveReason || "",
      leaveDuration: leaveDate.leaveDuration,
      leave_status: "pending",
    };

 
    const leaveRecord = await Leave.findOneAndUpdate(
      { id: uid ,
        employeeName:employeeName,
        employeeId:employeeId
      },
      { $push: { leaveSets: leaveEntry } },
      { new: true, upsert: true }
    );

    if (!leaveRecord) {
      return next(new ApiError(404, "Unable to save leave record"));
    }


    return res
      .status(200)
      .json(new ApiResponse(200, leaveRecord, "Leave applied successfully"));
  } catch (error) {
    console.error("Error applying leave:", error);
    return next(new ApiError(500, error.message));
  }
});


const getLeaveSummary = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  try {
    const leaveSummary = await Leave.aggregate([
      { $match: { employeeId: userId } }, 
      { $unwind: "$leaveSets" }, 
      {
        $match: {
          "leaveSets.leaveType": { $in: ["sick-leave", "unpaid-leave", "casual-leave"] },
          "leaveSets.leave_status": "approved", 
        },
      },
      {
        $group: {
          _id: "$leaveSets.leaveType", 
          totalLeaveDays: { $sum: "$leaveSets.leaveDays" }, 
        },
      },
    ]);

    return res.status(200).json(new ApiResponse(200, leaveSummary, "Leave summary fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

const leaveEmployee= asyncHandler(async(req,res)=>{
    const foundUser=await Leave.find({
        leaveSets: {
            $elemMatch: {
              leave_status: { $in: "pending" },
            },
          },
    }, {leaveSets:1, employeeName:1, employeeId:1})

    if(!foundUser){
        throw new ApiError(404,"Couldn't find any user!")
    }


    return res.status(200).json(new ApiResponse(200, foundUser, "Users found"))
})


const getLeavesById=asyncHandler(async(req,res)=>{

    try {
  
      const { id } = req.params;
  
    
      const leaves = await Leave.find({id}).select({leaveSets:1})
  
    
      if (!leaves.length) {
       
        throw new ApiError(404,"No leaves found for this user." )
      }

     
      res.status(200).json(new ApiResponse(200, leaves, "data fetched successfully"));
    } catch (error) {
    
      throw new ApiError(500, error.message)
    }
  
})


  

export {applyForLeave,leaveEmployee,getLeaveSummary,getLeavesById}
