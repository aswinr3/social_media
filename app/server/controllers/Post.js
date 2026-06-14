import post_services from "../services/Post.js";
import uploadCloudinary from "../helpers/loudinary.js";

// Creates a new post, handles image upload to Cloudinary if provided, and saves the post
const createPost = async (req, res) => {
  try {
    const payload = req.body || {};
    console.log(payload);
    const fileSource = req.file ? req.file.buffer : payload.image;
    console.log(fileSource);
    if (fileSource) {
      try {
        const uploadResponse = await uploadCloudinary(fileSource);
        payload.image = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("cloudinary upload error :", uploadError.message);
      }
    }
    payload.createdAt = new Date().toISOString();
    const response = await post_services.createPost(payload);
    console.log(response);
    return res
      .status(201)
      .json({ message: "Post created Successfully", post: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "some error has happened in post controllers",
      error: err,
    });
  }
};

// Retrieves all posts from the database
const getPosts = async (req, res) => {
  try {
    const response = await post_services.getAllPosts();
    return res.status(200).json({
      message: "Posts fetched successfully",
      posts: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in getPosts controllers",
      error: err,
    });
  }
};

// Toggles like status for a post by a user
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const response = await post_services.likePost(id, userId);
    return res.status(200).json({
      message: "Post liked/unliked successfully",
      likes: response.likes,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in likePost controllers",
      error: err,
    });
  }
};

// Adds a comment to a specific post
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const commentData = req.body;
    const response = await post_services.addComment(id, commentData);
    return res.status(200).json({
      message: "Comment added successfully",
      comments: response.comments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in addComment controllers",
      error: err,
    });
  }
};

// Saves or unSaves a post for a user
const savePost = async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const result = await post_services.savePost(userId, postId);
    return res.status(200).json({
      message: result ? "Post saved successfully" : "Post unsaved successfully",
      saved: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in savePost controllers",
      error: err,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await post_services.deletePost(id);
    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in deletePost controllers",
      error: err,
    });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await post_services.getSavedPosts(userId);
    return res.status(200).json({
      message: "Saved posts fetched successfully",
      posts: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Some error has happened in getSavedPosts controllers",
      error: err,
    });
  }
};

const post_controllers = {
  createPost,
  getPosts,
  likePost,
  addComment,
  savePost,
  deletePost,
  getSavedPosts,
};

export default post_controllers;
