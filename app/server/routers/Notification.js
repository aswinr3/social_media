import express from "express";
import notification_controllers from "../controllers/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const notificationRouter = express.Router();

notificationRouter.get("/user/:id", verifyToken, notification_controllers.getNotifications);
notificationRouter.put("/:id/read", verifyToken, notification_controllers.markRead);
notificationRouter.post("/clear-message", verifyToken, notification_controllers.clearMessageNotifications);

export default notificationRouter;
