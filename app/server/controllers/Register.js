import user_services from "../services/Register.js";
import uploadCloudinary from "../helpers/loudinary.js";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
  try {
    const payload = req.body;

    if (req.file) {
        try {
            const uploadResponse = await uploadCloudinary(req.file.buffer);
            payload.avatar = uploadResponse.secure_url;
        } catch (uploadError) {
            console.error("New user upload error:", uploadError.message);
        }
    }

    // Hash password before saving
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(payload.password, salt);
    }

    const result = await user_services.createUser(payload);

    if (result === "Email already exist") {
      return res.status(409).json({ message: result });
    }

    // Remove password from sensitive data
    const userResponse = result.toObject ? result.toObject() : { ...result };
    delete userResponse.password;

    return res.status(200).json({ message: "User created", data: userResponse });
  } catch (error) {
    console.error("createUser controller error:", error.message);
    return res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { exclude, search } = req.query;
    const users = await user_services.getUsers(exclude, search);
    const following = exclude ? await user_services.getFollowing(exclude) : [];
    
    return res.status(200).json({ users, following });
  } catch (error) {
    console.error("getUsers controller error:", error.message);
    return res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    const { followerEmail, followingEmail } = req.body;
    const following = await user_services.followUser(followerEmail, followingEmail);
    return res.status(200).json({ message: following ? "Followed" : "Unfollowed", following });
  } catch (error) {
    console.error("followUser controller error:", error.message);
    return res.status(500).json({ message: "Error in follow operation", error: error.message });
  }
};

const register_controllers = { createUser, getUsers, followUser };
export default register_controllers;
