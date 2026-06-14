import profile_services from "../services/Profile.js";
import post_services from "../services/Post.js";
import uploadCloudinary from "../helpers/loudinary.js";

const getProfileStats = async (req, res) => {
  try {
    const { email } = req.query;
    const posts = await post_services.getUserPosts(email);
    const followers = await profile_services.getFollowersCount(email);
    const following = await profile_services.getFollowingCount(email);
    
    return res.status(200).json({
      postCount: posts.length,
      followers,
      following,
      posts
    });
  } catch (error) {
    console.error("getProfileStats controller error:", error.message);
    return res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

const getFriendsList = async (req, res) => {
  try {
    const { email } = req.query;
    const friends = await profile_services.getFriendsList(email);
    return res.status(200).json(friends);
  } catch (error) {
    console.error("getFriendsList controller error:", error.message);
    return res.status(500).json({ message: "Error fetching friends", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (req.file) {
      try {
        const uploadResponse = await uploadCloudinary(req.file.buffer);
        body.avatar = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
      }
    }

    const result = await profile_services.updateUser(id, body);
    return res.status(200).json({ message: "Profile updated", user: result });
  } catch (error) {
    console.error("updateProfile controller error:", error.message);
    return res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await profile_services.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await post_services.getUserPosts(user.email);
    const followers = await profile_services.getFollowersCount(user.email);
    const following = await profile_services.getFollowingCount(user.email);
    
    return res.status(200).json({
      user,
      postCount: posts.length,
      followers,
      following,
      posts
    });
  } catch (error) {
    console.error("getProfileById controller error:", error.message);
    return res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

const profile_controllers = {
  getProfileStats,
  getFriendsList,
  updateProfile,
  getProfileById
};

export default profile_controllers;
