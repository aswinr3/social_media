import express from "express";
import chat_controllers from "../controllers/Chat.js";
import { verifyToken } from "../middleware/auth.js";

const chatRouter = express.Router();

chatRouter.post("/send", verifyToken, chat_controllers.sendMessage);
chatRouter.get("/history", verifyToken, chat_controllers.getChatHistory);

export default chatRouter;
