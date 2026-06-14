import express from "express";
import { validateCreateUser } from "../schemas/Register.js";
import register_controllers from '../controllers/Register.js'
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

const userRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

userRouter.post("/", upload.single('avatar'), validateCreateUser, register_controllers.createUser);
userRouter.get("/", verifyToken, register_controllers.getUsers);
userRouter.post("/follow", register_controllers.followUser);

export default userRouter;
