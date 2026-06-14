import { client, DATABASE } from "../config/db.js";
import { ObjectId } from "mongodb";

const createPost = async (values) => {
  try {
    const data = await client.db(DATABASE).collection("posts").insertOne(values);
    return data;
  } catch (err) {
    console.log("error", err);
  }
};

const getAllPosts = async () => {
  try {
    const data = await client.db(DATABASE).collection("posts").find({}).sort({ createdAt: -1, _id: -1 }).toArray();
    return data;
  } catch (err) {
    console.log("error", err);
  }
};

const likePost = async (postId, userId) => {
  try {
    const post = await client.db(DATABASE).collection("posts").findOne({ _id: new ObjectId(postId) });
    if (!post) throw new Error("Post not found");

    const likes = post.likes || [];
    const isLiked = likes.includes(userId);

    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const result = await client.db(DATABASE).collection("posts").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      update,
      { returnDocument: "after" }
    );
    return result;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

const addComment = async (postId, commentData) => {
  try {
    const comment = {
      _id: new ObjectId(),
      ...commentData,
      createdAt: new Date().toISOString(),
    };

    const result = await client.db(DATABASE).collection("posts").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } },
      { returnDocument: "after" }
    );
    return result;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

const savePost = async (userId, postId) => {
  try {
    const savedPost = await client.db(DATABASE).collection("saved_posts").findOne({ userId, postId });
    if (savedPost) {
      await client.db(DATABASE).collection("saved_posts").deleteOne({ userId, postId });
      return false; // Unsaved
    } else {
      await client.db(DATABASE).collection("saved_posts").insertOne({ userId, postId, createdAt: new Date().toISOString() });
      return true; // Saved
    }
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

const getUserPosts = async (email) => {
  try {
    return await client.db(DATABASE).collection("posts").find({ 
      $or: [
        { email },
        { "userData.email": email },
        { authorId: email }
      ]
    }).sort({ createdAt: -1, _id: -1 }).toArray();
  } catch (err) {
    console.log("getUserPosts error:", err.message);
    throw err;
  }
};

const deletePost = async (postId) => {
  try {
    const result = await client.db(DATABASE).collection("posts").deleteOne({ _id: new ObjectId(postId) });
    return result;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

const getSavedPosts = async (userId) => {
  try {
    // 1. Get saved post entries for this user
    const savedEntries = await client.db(DATABASE).collection("saved_posts").find({ userId }).toArray();
    
    if (savedEntries.length === 0) return [];

    // 2. Extract postIds
    const postIds = savedEntries.map(entry => new ObjectId(entry.postId));

    // 3. Fetch full post details from posts collection
    const posts = await client.db(DATABASE).collection("posts").find({ _id: { $in: postIds } }).sort({ createdAt: -1, _id: -1 }).toArray();
    
    return posts;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

const post_services = {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  savePost,
  getUserPosts,
  deletePost,
  getSavedPosts
};
export default post_services;
