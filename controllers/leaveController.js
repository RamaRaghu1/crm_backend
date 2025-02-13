import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Leave from "../models/leaveModel.js";


const rejectedLeaveReq = asyncHandler(async (req, res) => {
  const rejectedLeaves = await Leave.aggregate([
    { $match: { leave_status: "rejected" } }, // Get all rejected leave requests
    { $sort: { _id: -1 } }, // Sort by latest first
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user_details",
      },
    },
    { $unwind: "$user_details" }, // Convert array to object
    {
      $project: {
        _id: 1,
        userId: 1,
        leaveType: 1,
        startDate: 1,
        endDate: 1,
        leaveDays: 1,
        leaveDuration: 1,
        leave_status: 1,
        leaveReason: 1,
        createdAt: 1,
        "user_details._id": 1,
        "user_details.name": 1,
        "user_details.email": 1,
        "user_details.phone": 1,
        "user_details.team": 1,
        "user_details.branch": 1,
        "user_details.employeeId": 1,
      },
    },
  ]).exec();

  return res
    .status(200)
    .json(
      new ApiResponse(200, rejectedLeaves, "rejected leave requests retrieved")
    );
});

const approvedLeaveReq = asyncHandler(async (req, res) => {
  const approvedLeaves = await Leave.aggregate([
    { $match: { leave_status: "approved" } }, // Get all approved leave requests
    { $sort: { _id: -1 } }, // Sort by latest first
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user_details",
      },
    },
    { $unwind: "$user_details" }, // Convert array to object
    {
      $project: {
        _id: 1,
        userId: 1,
        leaveType: 1,
        startDate: 1,
        endDate: 1,
        leaveDays: 1,
        leaveDuration: 1,
        leave_status: 1,
        leaveReason: 1,
        createdAt: 1,
        "user_details._id": 1,
        "user_details.name": 1,
        "user_details.email": 1,
        "user_details.phone": 1,
        "user_details.team": 1,
        "user_details.branch": 1,
        "user_details.employeeId": 1,
      },
    },
  ]).exec();

  return res
    .status(200)
    .json(
      new ApiResponse(200, approvedLeaves, "approved leave requests retrieved")
    );
});


const deleteLeave = asyncHandler(async (req, res) => {
  try {
    const { leaveId } = req.body; // Assuming leaveId is sent in request body

    if (!leaveId) {
      throw new ApiError(400, "Leave ID is required");
    }

    const leaveRecord = await Leave.findByIdAndDelete(leaveId);

    if (!leaveRecord) {
      throw new ApiError(404, "Leave record not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Leave record deleted successfully"));
  } catch (error) {
    // console.error("Error deleting leave:", error);
    throw new ApiError(500, error.message);
  }
});

const checkIsManagement = async (userId) => {
  const user = await User.findById(userId);
  if (!user.permissions.accessLeaveRequest) {
    throw new ApiError(
      400,
      "You don't have permission to access leave requests!"
    );
  }
};

const decimalOpt = (number, digits) => {
  digits = digits ? digits : 8;
  number = Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits);
  return number;
};
const getDaysInMonth = (month, year) => {
  const endDate = new Date(year, month, 0);
  const daysInMonth = endDate.getDate();
  const today = new Date();

  return month === today.getMonth() + 1 && year === today.getFullYear()
    ? today.getDate()
    : daysInMonth;
};

const daysInMonth = (month, year) => {
  const daysInMonths = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return daysInMonths[month - 1];
};

const getMonthDates = (month, year) => {
  if (month < 1 || month > 12) {
    throw new Error(
      "Invalid month number. Please enter a number between 1 and 12."
    );
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const getData = async (userId, dateRange) => {
  const leaveSummary = await Leave.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startDate: { $gte: new Date(dateRange.startDate) },
        endDate: { $lte: new Date(dateRange.endDate) },
      },
    },
    {
      $group: {
        _id: "$leaveType",
        count: { $sum: "$leaveDays" },
      },
    },
  ]);

  const userSalary = await User.findOne({ _id: userId }, { salary: 1 });
  return { leaveSummary, usersalary: userSalary };
};

const Summary = asyncHandler(async (req, res, next) => {
  try {
    const today = new Date();
    const {
      month = today.getMonth() + 1,
      year = today.getFullYear(),
      employeeId,
      branch,
    } = req.body;

    if (month > today.getMonth() + 1 && year >= today.getFullYear()) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "You can't fetch data for next month")
        );
    }

    const noOfDays = daysInMonth(month, year);
    const datesPassed = getDaysInMonth(month, year);
    const dateRange = getMonthDates(month, year);
    // console.log("dateRange===>", dateRange);

    const branchEmployees = await User.find({
      employeeId: new RegExp(employeeId, "i"),
      branch: new RegExp(branch, "i"),
    }).exec();

    const result = await Promise.all(
      branchEmployees.map(async (employee) => {
        const userInfo = await getData(employee._id, dateRange);
        // console.log("userInfo====>", userInfo);

        const unpaidLeaves =
          userInfo.leaveSummary.find((leave) => leave._id === "unpaid-leave")
            ?.count || 0;

        return {
          employeeId: employee.employeeId,
          email: employee.email,
          name: employee.name,
          position: employee.position,
          branch: employee.branch,
          team: employee.team,
          persalary: employee.salary,
          leaveSummary: userInfo.leaveSummary,
          present: datesPassed - unpaidLeaves,
          salaryTotal: userInfo.usersalary.salary
            ? decimalOpt(
                (userInfo.usersalary.salary / noOfDays) *
                  (datesPassed - unpaidLeaves),
                2
              )
            : null,
        };
      })
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Leave summary fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});
const approveOrRejectLeave = asyncHandler(async (req, res) => {
  const { leaveId, isApproved } = req.body; // Extract leaveId and isApproved from the request body

  if (!leaveId || typeof isApproved !== "boolean") {
    return res.status(400).json({ message: "Invalid request parameters." });
  }

  const newStatus = isApproved ? "approved" : "rejected";

  await checkIsManagement(req.user._id)

  try {
    // Update the leave status
    const updatedLeave = await Leave.findOneAndUpdate(
      {
        _id: leaveId,
        leave_status: "pending",
      },
      {
        $set: {
          leave_status: newStatus,
          approvedBy: req.user.id,
          approvedAt: isApproved ? new Date() : null,
        },
      },
      { new: true }
    );

    if (!updatedLeave) {
      throw new ApiError(404, "Leave not found or not in a pending state.");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedLeave, `Leave successfully ${newStatus}. `)
      );
  } catch (error) {
    // console.error(error);
    throw new ApiError(500, error.message);
  }
});


const applyForLeave = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, leaveReason, leaveType, leaveDuration } =
    req.body;

  const requiredFields = { startDate, endDate, leaveReason, leaveType, leaveDuration };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ message: `${key} is required` });
    }
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return next(new ApiError(400, "Invalid start date or end date"));
    }

    let leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24) + 1);
    if (leaveDuration === "half-day") leaveDays -= 0.5;

    // Get first and last day of the current month
    const currentMonthStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const currentMonthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    // Find all leaves in the current month for the user
    const userLeavesThisMonth = await Leave.find({
      userId: req.user._id,
      startDate: { $gte: currentMonthStart, $lte: currentMonthEnd },
      endDate: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    // Count leave days per type
    const leaveCounts = {
      "sick-leave": 0,
      "casual-leave": 0,
      "unpaid-leave": 0,
    };

    userLeavesThisMonth.forEach((leave) => {
      if (leaveCounts[leave.leaveType] !== undefined) {
        leaveCounts[leave.leaveType] += leave.leaveDays;
      }
    });

    // Enforce monthly limits
    const leaveLimits = {
      "sick-leave": 3,
      "casual-leave": 2,
      "unpaid-leave": 6,
    };

    if (leaveCounts[leaveType] + leaveDays > leaveLimits[leaveType]) {
      return next(
        new ApiError(
          400,
          `You can't take more than ${leaveLimits[leaveType]} ${leaveType.replace("-", " ")} per month.`
        )
      );
    }

    // Overlapping leave check
    const existingLeave = await Leave.findOne({
      userId: req.user._id,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }, // Overlapping range
      ],
    }).exec();

    if (existingLeave) {
      return res
        .status(400)
        .json(new ApiResponse(400, existingLeave, "Leave already exists for this date range"));
    }

    // Create leave request
    const leaveData = {
      userId: req.user._id,
      startDate: start,
      endDate: end,
      leaveDays,
      leaveReason,
      leaveType,
      leaveDuration,
    };

    const createdLeave = await Leave.create(leaveData);
    return res
      .status(200)
      .json(new ApiResponse(200, createdLeave, "Leave applied successfully"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

const leaveEmployee = asyncHandler(async (req, res) => {
  const pendingLeaves = await Leave.aggregate([
    { $match: { leave_status: "pending" } }, // Get all pending leave requests
    { $sort: { _id: -1 } }, // Sort by latest first
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user_details",
      },
    },
    { $unwind: "$user_details" }, // Convert array to object
    {
      $project: {
        _id: 1,
        userId: 1,
        leaveType: 1,
        startDate: 1,
        endDate: 1,
        leaveDays: 1,
        leaveDuration: 1,
        leave_status: 1,
        leaveReason: 1,
        createdAt: 1,
        "user_details._id": 1,
        "user_details.name": 1,
        "user_details.email": 1,
        "user_details.phone": 1,
        "user_details.team": 1,
        "user_details.branch": 1,
        "user_details.employeeId": 1,
      },
    },
  ]).exec();

  return res
    .status(200)
    .json(
      new ApiResponse(200, pendingLeaves, "Pending leave requests retrieved")
    );
});

const getLeaveSummary = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const leaveSummary = await Leave.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
          leave_status: "approved",
        },
      },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: "$leaveDays" },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { leaveSummary },
          "Leave summary fetched successfully"
        )
      );
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

const getLeavesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("====",id);

    const foundData = await Leave.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          let: {
            sell_user_id: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$sell_user_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                team: 1,
                branch: 1,
                employeeId: 1,
                username: 1,
                email: 1,
                phone: 1,
              },
            },
          ],
          as: "user_details",
        },
      },
      {
        $unwind: {
          path: "$user_details",
        },
      },
    ]).exec();

    if (!foundData.length) {
      throw new ApiError(404, "No leaves found for this user.");
    } else {
      res
        .status(200)
        .json(new ApiResponse(200, foundData, "data fetched successfully"));
    }
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

export {
  applyForLeave,
  leaveEmployee,
  getLeaveSummary,
  getLeavesById,
  approveOrRejectLeave,
  Summary,
  rejectedLeaveReq,
  approvedLeaveReq,
  deleteLeave,
};
