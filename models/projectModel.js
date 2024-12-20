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
    photo: {
        public_id: {
            type: String,
            // required: true,
        },
        url: {
            type: String,
            // required: true,
        },
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
        required: true,
    },
    developers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // type:String,
            // required: true,
        },
    ],
    status: {
        type: String,
        default: "Todo",
        enum: {
            values: ["Todo", "Progress", "Completed"],
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