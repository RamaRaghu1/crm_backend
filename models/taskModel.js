import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter your task title"],
    },
    description: {
      type: String,
      required: [true, "Please enter your task description"],
    },
    startDate: {
      type: Date,
      required: [true, "Please enter your task start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please enter your task end date"],
    },
    priority: {
      type: String,
      default: "Low",
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Please select correct priority for task",
      },
    },
    projectId:{
         type: mongoose.Schema.Types.ObjectId,
              ref: "Project",
    },
    status: {
      type: String,
      default: "To Do",
      enum: {
        values: ["To Do", "In Progress", "Review", "Reassigned", "Completed"],
        message: "Please select correct status for task",
      },
    },

    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please assign a Developer!!!"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
