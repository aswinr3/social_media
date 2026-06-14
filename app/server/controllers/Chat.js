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

const chat_controllers = {
  sendMessage,
  getChatHistory
};

export default chat_controllers;
