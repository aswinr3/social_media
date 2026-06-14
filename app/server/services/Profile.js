import { client, DATABASE } from "../config/db.js";
import { ObjectId } from "mongodb";

const updateUser = async (id, updateData) => {
  try {
    const { _id, password, ...data } = updateData;
    const result = await client.db(DATABASE).collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    return result;
  } catch (error) {
    console.error("updateUser service error:", error.message);
    throw new Error("Database update failed");
  }
};

const getFollowersCount = async (email) => {
  try {
    return await client.db(DATABASE).collection("follows").countDocuments({ followingEmail: email });
  } catch (error) {
    console.error("getFollowersCount error:", error.message);
    throw new Error("Count failed");
  }
};

const getFollowingCount = async (email) => {
  try {
    return await client.db(DATABASE).collection("follows").countDocuments({ followerEmail: email });
  } catch (error) {
    console.error("getFollowingCount error:", error.message);
    throw new Error("Count failed");
  }
};

const getFriendsList = async (email) => {
  try {
    const followersEmails = await client.db(DATABASE).collection("follows").find({ followingEmail: email }).toArray();
    const followingEmails = await client.db(DATABASE).collection("follows").find({ followerEmail: email }).toArray();

    const followerDetails = await client.db(DATABASE).collection("users")
      .find({ email: { $in: followersEmails.map(f => f.followerEmail) } })
      .project({ password: 0 })
      .toArray();

    const followingDetails = await client.db(DATABASE).collection("users")
      .find({ email: { $in: followingEmails.map(f => f.followingEmail) } })
      .project({ password: 0 })
      .toArray();

    return { followers: followerDetails, following: followingDetails };
  } catch (error) {
    console.error("getFriendsList error:", error.message);
    throw new Error("Failed to fetch friends list");
  }
};

const getUserById = async (id) => {
  try {
    return await client.db(DATABASE).collection("users").findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
  } catch (error) {
    console.error("getUserById error:", error.message);
    throw new Error("Failed to fetch user");
  }
};

const profile_services = {
  updateUser,
  getFollowersCount,
  getFollowingCount,
  getFriendsList,
  getUserById
};

export default profile_services;
