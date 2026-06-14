import { client, DATABASE } from "../config/db.js";

const createUser = async (values) => {
  
  try {
    const getUser = await client.db(DATABASE).collection("users").findOne({ email: values.email })

    if (getUser) return "Email already exist";

    const data = await client
      .db(DATABASE)
      .collection("users")
      .insertOne(values);
    return data;
  } catch (error) {
    console.error("createUser service error:", error.message);
    throw new Error("Database insert failed");
  }
};

const getUsers = async (excludeEmail, searchQuery) => {
  try {
    let query = excludeEmail ? { email: { $ne: excludeEmail } } : {};
    if (searchQuery) {
        query = {
            ...query,
            $or: [
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        };
    }
    const users = await client.db(DATABASE).collection("users").find(query).limit(20).toArray();
    return users;
  } catch (error) {
    console.error("getUsers service error:", error.message);
    throw new Error("Database fetch failed");
  }
};

const followUser = async (followerEmail, followingEmail) => {
  try {
    const followRecord = await client.db(DATABASE).collection("follows").findOne({ followerEmail, followingEmail });
    if (followRecord) {
      await client.db(DATABASE).collection("follows").deleteOne({ followerEmail, followingEmail });
      return false; // Unfollowed
    } else {
      await client.db(DATABASE).collection("follows").insertOne({ followerEmail, followingEmail, createdAt: new Date().toISOString() });
      return true; // Followed
    }
  } catch (error) {
    console.error("followUser service error:", error.message);
    throw new Error("Database follow operation failed");
  }
};

const getFollowing = async (followerEmail) => {
  try {
    const list = await client.db(DATABASE).collection("follows").find({ followerEmail }).toArray();
    return list.map(f => f.followingEmail);
  } catch (error) {
    console.error("getFollowing service error:", error.message);
    throw new Error("Database fetch failed");
  }
};

const user_services = {
  createUser,
  getUsers,
  followUser,
  getFollowing
};

export default user_services;
