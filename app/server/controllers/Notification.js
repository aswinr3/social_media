import notification_services from "../services/Notification.js";

const getNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const notifications = await notification_services.getNotificationsForUser(id);
    return res.status(200).json({
      message: "Notifications fetched successfully",
      notification: notifications,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in notification controllers",
      error: err,
    });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notification_services.markNotificationAsRead(id);
    return res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in notification controllers",
      error: err,
    });
  }
};

const clearMessageNotifications = async (req, res) => {
  try {
    const { recipientId, senderId } = req.body;
    await notification_services.clearNotificationsByType(recipientId, senderId, "message");
    return res.status(200).json({
      message: "Message notifications cleared",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in notification controllers",
      error: err,
    });
  }
};

const notification_controllers = {
  getNotifications,
  markRead,
  clearMessageNotifications
};

export default notification_controllers;
