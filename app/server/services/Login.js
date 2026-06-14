import { client, DATABASE } from "../config/db.js";

const verifyLogin = async (values) => {
  try {
    const response = await client
      .db(DATABASE)
      .collection("users")
      .findOne({ email: values.email });
    console.log(response);
    return response;
  } catch (err) {
    throw new Error("failed to login ", err);
  }
};

const login_service = {
  verifyLogin,
};
export default login_service;
