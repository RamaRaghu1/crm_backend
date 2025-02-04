import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import { ErrorMiddleware } from "./middleware/ErrorMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import cloudinary from "cloudinary";
import attendanceRouter from "./routes/attendanceRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import holidayRouter from "./routes/holidayRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";



const app = express();

const corsOptions = {
  credentials: true,
  origin: [
    "https://hrm.kairaatechserve.com/",
    "https://hrm.kairaatechserve.com",
    "http://localhost:5173/",
    "http://localhost:5173"
  ],
 
};


app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/holiday", holidayRouter);
app.use("/api/v1/leave",leaveRouter)
app.use("/api/v1/project",projectRoutes);
app.use("/api/v1/attendance",attendanceRouter);
app.use("/api/v1/task",taskRouter);
app.use("/api/v1/announcement",announcementRouter);

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
})
app.get("/", (req, res) => {
  res.send("API is running");
});


app.use(ErrorMiddleware);
export default app;
