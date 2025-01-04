import { Router } from "express";
import { applyForLeave, getLeaveSummary, leaveEmployee ,getLeavesById} from "../controllers/leaveController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const leaveRouter=Router();

leaveRouter.route("/apply-leave").post(verifyJWT,applyForLeave);
leaveRouter.route("/applied-leave").get(verifyJWT,leaveEmployee);
leaveRouter.route("/leave-summary").get(verifyJWT,getLeaveSummary);
leaveRouter.route("/leaves/:id").get(verifyJWT,getLeavesById);

export default leaveRouter;