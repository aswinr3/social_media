import express from "express";
import profile_controllers from "../controllers/Profile.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";

const profileRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

profileRouter.get("/stats", verifyToken, profile_controllers.getProfileStats);
profileRouter.get("/friends", verifyToken, profile_controllers.getFriendsList);
profileRouter.get("/:id", verifyToken, profile_controllers.getProfileById);
profileRouter.put("/:id", verifyToken, upload.single('avatar'), profile_controllers.updateProfile);

export default profileRouter;
