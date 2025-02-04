import { addAnnouncement, deleteAnnouncement, getAllAnnouncements, getAnnouncementById, updateAnnouncement } from "../controllers/announcementController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { Router } from "express";


const announcementRouter=Router();

announcementRouter.route("/add-announcement").post(verifyJWT,addAnnouncement);
announcementRouter.route("/delete-announcement").delete(verifyJWT,deleteAnnouncement);
announcementRouter.route("/edit-announcement").put(verifyJWT, updateAnnouncement);
announcementRouter.route("/get-all-announcement").get(verifyJWT, getAllAnnouncements);
announcementRouter.route("/get-announcement").post(verifyJWT, getAnnouncementById);

export default announcementRouter