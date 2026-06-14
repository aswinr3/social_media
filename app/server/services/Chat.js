import { client, DATABASE } from "../config/db.js";
import notification_services from "./Notification.js";
import { getIO } from "../socket.js";

const sendMessage = async (values) => {
  try {
    const { senderId, recipientId, text, senderName } = values;
    
    // Save message
    const messageResult = await client.db(DATABASE).collection("messages").insertOne({
      senderId,
      recipientId,
      text,
      createdAt: new Date().toISOString()
    });

    const newMessage = { ...values, _id: messageResult.insertedId, createdAt: new Date().toISOString() };

    // Emit real-time message to recipient
    const io = getIO();
    io.to(recipientId).emit("receive_message", newMessage);

    // Create notification for recipient
    const notif = {
        recipientId,
        senderId,
        senderName,
        content: ` sent you a message: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`,
        type: "message",
        link: "/chat"
    };

    await notification_services.createNotification(notif);
    
    // Emit real-time notification
    io.to(recipientId).emit("receive_notification", notif);

    return newMessage;
  } catch (err) {
    console.log("error", err);
  }
};

const getMessagesBetweenUsers = async (user1, user2) => {
  try {
    const data = await client.db(DATABASE).collection("messages").find({
      $or: [
        { senderId: user1, recipientId: user2 },
        { senderId: user2, recipientId: user1 }
      ]
    }).sort({ createdAt: 1 }).toArray();
    return data;
  } catch (err) {
    console.log("error", err);
  }
};

const chat_services = {
  sendMessage,
  getMessagesBetweenUsers
};
export default chat_services;
