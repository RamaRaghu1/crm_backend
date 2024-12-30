import mongoose from "mongoose";



const projectScehema=new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter your project title"],
    },
    description: {
        type: String,
        required: [true, "Please enter your project description"],
    },
    startDate: {
        type: Date,
        required: [true, "Please enter your project start date"],
    },
    endDate: {
        type: Date,
        required: [true, "Please enter your project end date"],
    },
   
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true,
    },
    projectLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
// type:String,
        // required: true,
    },
    developers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // type:String,
            // required: true,
        },
    ],
    tasks:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            // type:String,
            // required: true,
        },
    ],
    status: {
        type: String,
        default: "To Do",
        enum: {
            values: ["To Do", "In Progress", "Completed"],
            message: "Please select correct status for project",
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps:true})

const Project =mongoose.model("Project", projectScehema);

export default Project;