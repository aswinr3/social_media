import express from "express";
import post_controllers from "../controllers/Post.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";

const postRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

postRouter.post("/", verifyToken, upload.single("image"), post_controllers.createPost);
postRouter.get("/", verifyToken, post_controllers.getPosts);
postRouter.put("/:id/like", verifyToken, post_controllers.likePost);
postRouter.post("/:id/comment", verifyToken, post_controllers.addComment);
postRouter.post("/save", verifyToken, post_controllers.savePost);
postRouter.get("/saved/:userId", verifyToken, post_controllers.getSavedPosts);
postRouter.delete("/:id", verifyToken, post_controllers.deletePost);

export default postRouter;
