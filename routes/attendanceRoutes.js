import { Router } from "express";
import { updateAttendance ,getAttendanceData} from "../controllers/attendanceController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const attendanceRouter=Router();

attendanceRouter.route("/update-attendance").post( verifyJWT,updateAttendance);
attendanceRouter.route("/attendance-data").post(verifyJWT,getAttendanceData)


export default attendanceRouter;