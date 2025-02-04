import mongoose from "mongoose";

const announcementSchema=new mongoose.Schema(
    {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        priority: {
          type: String,
          required: true,
          enum: ["Medium", "Low", "High"], 
        },
        date: {
          type: Date,
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
          },
      },
{timestamps:true})

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;