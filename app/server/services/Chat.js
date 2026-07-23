import { ObjectId } from "mongodb";
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

// Edit a message. Only the original sender may edit it.
const editMessage = async (messageId, userId, text) => {
  try {
    const messages = client.db(DATABASE).collection("messages");
    const existing = await messages.findOne({ _id: new ObjectId(messageId) });

    if (!existing) return { error: "not_found" };
    if (existing.senderId !== userId) return { error: "forbidden" };

    const editedAt = new Date().toISOString();
    await messages.updateOne(
      { _id: new ObjectId(messageId) },
      { $set: { text, edited: true, editedAt } }
    );

    const updated = { ...existing, text, edited: true, editedAt };

    // Push the change to the other participant in real time.
    getIO().to(existing.recipientId).emit("message_edited", updated);

    return updated;
  } catch (err) {
    console.log("editMessage error", err);
    throw new Error("Failed to edit message");
  }
};

// Delete a message. Only the original sender may delete it.
const deleteMessage = async (messageId, userId) => {
  try {
    const messages = client.db(DATABASE).collection("messages");
    const existing = await messages.findOne({ _id: new ObjectId(messageId) });

    if (!existing) return { error: "not_found" };
    if (existing.senderId !== userId) return { error: "forbidden" };

    await messages.deleteOne({ _id: new ObjectId(messageId) });

    getIO()
      .to(existing.recipientId)
      .emit("message_deleted", { _id: messageId });

    return { _id: messageId };
  } catch (err) {
    console.log("deleteMessage error", err);
    throw new Error("Failed to delete message");
  }
};

const chat_services = {
  sendMessage,
  getMessagesBetweenUsers,
  editMessage,
  deleteMessage
};
export default chat_services;
