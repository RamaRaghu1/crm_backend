import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Leave from "../models/leaveModel.js";

const applyForLeave = asyncHandler(async (req, res, next) => {
  const { uid, leaveDate, employeeName, employeeId ,branch} = req.body;

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
      createdAt:new Date()
    };

 
    const leaveRecord = await Leave.findOneAndUpdate(
      { id: uid ,
        employeeName:employeeName,
        employeeId:employeeId,
        branch:branch,
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
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid User ID");
  }

  try {
    const leaveSummary = await Leave.aggregate([
      { $match: { id: new mongoose.Types.ObjectId(id) } }, 
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

const leaveEmployee = asyncHandler(async (req, res) => {
  const foundUser = await Leave.find(
      {
          leaveSets: {
              $elemMatch: {
                  leave_status: "pending",
              },
          },
      },
      {
          leaveSets: {
              $filter: {
                  input: "$leaveSets",
                  as: "leaveSet",
                  cond: { $eq: ["$$leaveSet.leave_status", "pending"] },
              },
          },
          employeeName: 1,
          employeeId: 1,
          branch:1,
      }
  ).sort({ createdAt: -1 });

  // if (!foundUser || foundUser.length === 0) {
  //     throw new ApiError(404, "Couldn't find any user!");
  // }

  return res.status(200).json(new ApiResponse(200, foundUser, "Users found"));
});


const rejectedLeaveReq = asyncHandler(async (req, res) => {
  const foundUser = await Leave.find(
      {
          leaveSets: {
              $elemMatch: {
                  leave_status: "rejected",
              },
          },
      },
      {
          leaveSets: {
              $filter: {
                  input: "$leaveSets",
                  as: "leaveSet",
                  cond: { $eq: ["$$leaveSet.leave_status", "rejected"] },
              },
          },
          employeeName: 1,
          employeeId: 1,
          branch:1,
      }
  ).sort({ createdAt: -1 });

  // if (!foundUser || foundUser.length === 0) {
  //     throw new ApiError(404, "Couldn't find any user!");
  // }

  return res.status(200).json(new ApiResponse(200, foundUser, "Users found"));
});

const approvedLeaveReq = asyncHandler(async (req, res) => {
  const foundUser = await Leave.find(
      {
          leaveSets: {
              $elemMatch: {
                  leave_status: "approved",
              },
          },
      },
      {
          leaveSets: {
              $filter: {
                  input: "$leaveSets",
                  as: "leaveSet",
                  cond: { $eq: ["$$leaveSet.leave_status", "approved"] },
              },
          },
          employeeName: 1,
          employeeId: 1,
          branch:1,
      }
  ).sort({ createdAt: -1 });

  // if (!foundUser || foundUser.length === 0) {
  //     throw new ApiError(404, "Couldn't find any user!");
  // }

  return res.status(200).json(new ApiResponse(200, foundUser, "Users found"));
});


const getLeavesById=asyncHandler(async(req,res)=>{

    try {
  
      const { id } = req.params;
  
    
      const leaves = await Leave.find({id}).select({leaveSets:1}).sort({ createdAt: -1 })
  
    
      if (!leaves.length) {
       
        throw new ApiError(404,"No leaves found for this user." )
      }

     
      res.status(200).json(new ApiResponse(200, leaves, "data fetched successfully"));
    } catch (error) {
    
      throw new ApiError(500, error.message)
    }
  
})


const approveOrRejectLeave = asyncHandler(async (req, res) => {
  const { leaveId, isApproved } = req.body; // Extract leaveId and isApproved from the request body

  if (!leaveId || typeof isApproved !== 'boolean') {
    return res.status(400).json({ message: "Invalid request parameters." });
  }

  const newStatus = isApproved ? "approved" : "rejected";

  try {
    // Update the leave status
    const updatedLeave = await Leave.findOneAndUpdate(
      {
        "leaveSets._id": leaveId, 
        "leaveSets.leave_status": "pending", 
      },
      {
        $set: {
          "leaveSets.$.leave_status": newStatus,
          "leaveSets.$.approvedBy":req.user.id,
          "leaveSets.$.approvedAt": isApproved ? new Date() : null,
        },
      },
      { new: true } 
    );

    if (!updatedLeave) {
    throw new ApiError(404, "Leave not found or not in a pending state.")
    }

    res.status(200).json(new ApiResponse(200, updatedLeave,`Leave successfully ${newStatus}. `))
   
  } catch (error) {
    console.error(error);
    throw new ApiError(500, error.message)
  }
});

const deleteLeave = asyncHandler(async(req,res)=>{
  try {
    const { employeeId, leaveSetId } = req.body;

  
    const employeeLeave = await Leave.findOne({ employeeId });

    if (!employeeLeave  ) {
      throw new ApiError(404,"Employee leave record not found" );
    }
    const leaveExists = employeeLeave.leaveSets.some((leave) => leave._id.toString() === leaveSetId);
    if (!leaveExists) {
      throw new ApiError(404, "Leave record not found");
    }

    // Filter out the leaveSet to be deleted
    employeeLeave.leaveSets = employeeLeave.leaveSets.filter(
      (leave) => leave._id.toString() !== leaveSetId
    );

    await employeeLeave.save();
    res.status(200).json(new ApiResponse(200, null,"Leave record deleted successfully" ))
  
  } catch (error) {
    throw new ApiError(500, error.message)
   
  }
})


const checkIsManagement=async(userId)=>{
  const user = await User.findById(userId); 
  if (user.team !=='Management') {
    throw new ApiError(
      400,
      "You don't have permission to access this resource!"
    );
  }
}

const decimalOpt = (number, digits) => {
  digits = digits ? digits : 8
  number = Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits)
  return number
}
const getDaysInMonth = (month, year) => {
  const endDate = new Date(year, month, 0);
  const daysInMonth = endDate.getDate();
  const today = new Date();

  return (month === today.getMonth() + 1 && year === today.getFullYear()) ? today.getDate() : daysInMonth;
};

const daysInMonth = (month, year) => {
  const daysInMonths = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonths[month - 1];
};

const getMonthDates = (month, year) => {
  if (month < 1 || month > 12) {
    throw new Error("Invalid month number. Please enter a number between 1 and 12.");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

const getData = async (userId, dateRange) => {
  const leaveSummary = await Leave.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startDate: { $gte: new Date(dateRange.startDate) },
        endDate: { $lte: new Date(dateRange.endDate) }
      }
    },
    {
      $group: {
        _id: '$leaveType',
        count: { $sum: '$leaveDays' }
      }
    }
  ]);

  const userSalary = await User.findOne({ _id: userId }, { salary: 1 });
  return { leaveSummary, usersalary: userSalary };
};

const Summary = asyncHandler(async (req, res, next) => {
  try {
    const today = new Date();
    const { month = today.getMonth() + 1, year = today.getFullYear(), employeeId, branch } = req.body;

    if (month > today.getMonth() + 1 && year >= today.getFullYear()) {
      return res.status(200).json(new ApiResponse(200, null, "You can't fetch data for next month"));
    }

    const noOfDays = daysInMonth(month, year);
    const datesPassed = getDaysInMonth(month, year);
    const dateRange = getMonthDates(month, year);

    const branchEmployees = await User.find({
      employeeId: new RegExp(employeeId, 'i'),
      branch: new RegExp(branch, 'i')
    }).exec();

    const result = await Promise.all(branchEmployees.map(async (employee) => {
      const userInfo = await getData(employee._id, dateRange);
      const unpaidLeaves = userInfo.leaveSummary.find(leave => leave._id === 'unpaid-leave')?.count || 0;

      return {
        employeeId: employee.employeeId,
        email: employee.email,
        name:employee.name,
        position: employee.position,
        branch: employee.branch,
        team: employee.team,
        persalary: employee.salary,
        leaveSummary: userInfo.leaveSummary,
        present: datesPassed - unpaidLeaves,
        salaryTotal: userInfo.usersalary.salary ? decimalOpt(((userInfo.usersalary.salary / noOfDays) * (datesPassed - unpaidLeaves)), 2) : null
      };
    }));

    return res.status(200).json(new ApiResponse(200, result, "Leave summary fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});


export {applyForLeave,leaveEmployee,getLeaveSummary,getLeavesById, approveOrRejectLeave,Summary, rejectedLeaveReq, approvedLeaveReq, deleteLeave }
