import { addHoliday, deleteHoliday, getAllHolidays, getHolidayById, updateHoliday } from "../controllers/holidayController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { Router } from "express";

const holidayRouter=Router();

holidayRouter.route("/add-holiday").post(verifyJWT,addHoliday);
holidayRouter.route("/delete-holiday").delete(verifyJWT,deleteHoliday);
holidayRouter.route("/edit-holiday").put(verifyJWT, updateHoliday);
holidayRouter.route("/get-all-holiday").get(verifyJWT, getAllHolidays);
holidayRouter.route("/get-holiday").post(verifyJWT, getHolidayById);

export default holidayRouter