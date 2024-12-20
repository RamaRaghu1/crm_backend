import { Router } from "express";
import { applyForLeave, getLeaveSummary, leaveEmployee ,getLeavesById} from "../controllers/leaveController.js";

const leaveRouter=Router();

leaveRouter.route("/apply-leave").post(applyForLeave);
leaveRouter.route("/applied-leave").get(leaveEmployee);
leaveRouter.route("/leave-summary").get(getLeaveSummary);
leaveRouter.route("/leaves/:id").get(getLeavesById);

export default leaveRouter;