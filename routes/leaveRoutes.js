import { Router } from "express";
import { applyForLeave, getLeaveSummary, leaveEmployee ,getLeavesById, approveOrRejectLeave} from "../controllers/leaveController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const leaveRouter=Router();

leaveRouter.route("/apply-leave").post(verifyJWT,applyForLeave);
leaveRouter.route("/applied-leave").get(verifyJWT,leaveEmployee);
leaveRouter.route("/leave-summary/:id").get(verifyJWT,getLeaveSummary);
leaveRouter.route("/leaves/:id").get(verifyJWT,getLeavesById);
leaveRouter.route("/approveOrRejectLeave/").post(verifyJWT,approveOrRejectLeave);

export default leaveRouter;