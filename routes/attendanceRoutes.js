import { Router } from "express";
import { updateAttendance ,getAttendanceData} from "../controllers/attendanceController.js";

const attendanceRouter=Router();

attendanceRouter.route("/update-attendance").post(updateAttendance);
attendanceRouter.route("/attendance-data").post(getAttendanceData)


export default attendanceRouter;