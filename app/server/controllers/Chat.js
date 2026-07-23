import chat_services from "../services/Chat.js";

const sendMessage = async (req, res) => {
  try {
    const payload = req.body;
    const response = await chat_services.sendMessage(payload);
    return res.status(201).json({
      message: "Message sent successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in chat controllers",
      error: err,
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const response = await chat_services.getMessagesBetweenUsers(user1, user2);
    return res.status(200).json({
      message: "Chat history fetched successfully",
      messages: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in chat controllers",
      error: err,
    });
  }
};

const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Ownership comes from the verified token, never from the request body.
    const result = await chat_services.editMessage(id, req.user.id, text.trim());

    if (result?.error === "not_found") {
      return res.status(404).json({ message: "Message not found" });
    }
    if (result?.error === "forbidden") {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    return res.status(200).json({ message: "Message updated", data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to edit message", error: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await chat_services.deleteMessage(id, req.user.id);

    if (result?.error === "not_found") {
      return res.status(404).json({ message: "Message not found" });
    }
    if (result?.error === "forbidden") {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    return res.status(200).json({ message: "Message deleted", data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete message", error: err.message });
  }
};

const chat_controllers = {
  sendMessage,
  getChatHistory,
  editMessage,
  deleteMessage
};

export default chat_controllers;
