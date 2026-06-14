import { client, DATABASE } from "../config/db.js";
import { ObjectId } from "mongodb";

const createNotification = async (values) => {
  try {
    const data = await client.db(DATABASE).collection("notifications").insertOne({
      ...values,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    return data;
  } catch (err) {
    console.log("error", err);
  }
};

const getNotificationsForUser = async (userId) => {
  try {
    const data = await client.db(DATABASE).collection("notifications").find({ recipientId: userId }).sort({ createdAt: -1 }).toArray();
    return data;
  } catch (err) {
    console.log("error", err);
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    const result = await client.db(DATABASE).collection("notifications").updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } }
    );
    return result;
  } catch (err) {
    console.log("error", err);
  }
};

const clearNotificationsByType = async (recipientId, senderId, type) => {
    try {
      const result = await client.db(DATABASE).collection("notifications").deleteMany(
        { recipientId, senderId, type }
      );
      return result;
    } catch (err) {
      console.log("error", err);
    }
  };

const notification_services = {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  clearNotificationsByType
};
export default notification_services;
