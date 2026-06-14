import express from "express";
import userRouter from "./routers/Register.js";
import profileRouter from "./routers/Profile.js";
import loginRouter from "./routers/Login.js";
import cors from "cors";
import { connectDatabase } from "./config/db.js";
import postRouter from "./routers/Post.js";
import notificationRouter from "./routers/Notification.js";
import chatRouter from "./routers/Chat.js";
import { createServer } from "http";
import { initSocket } from "./socket.js";

const app = express();
app.use(express.json());

// In production set CLIENT_URL to your Vercel frontend domain; falls back to "*" locally.
const allowedOrigin = process.env.CLIENT_URL || "*";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);



const httpServer = createServer(app);
initSocket(httpServer);

// Router
app.use("/register", userRouter);
app.use("/profile", profileRouter);
app.use('/login', loginRouter);
app.use('/posts',postRouter);
app.use('/notification', notificationRouter);
app.use('/chat', chatRouter);

// database setup


// Server running portal
const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`server is running in ${port}`);
});
await connectDatabase();

