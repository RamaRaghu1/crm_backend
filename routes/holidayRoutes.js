import { addHoliday, deleteHoliday, updateHoliday } from "../controllers/holidayController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { Router } from "express";

const holidayRouter=Router();

holidayRouter.route("/add-holiday").post(verifyJWT,addHoliday);
holidayRouter.route("/delete-holiday").delete(verifyJWT,deleteHoliday);
holidayRouter.route("/rejecteave").put(verifyJWT, updateHoliday);

export default holidayRouter