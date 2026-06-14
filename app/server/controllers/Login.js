import login_service from "../services/Login.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const verifyLogin = async (req, res) => {
  const payload = req.body;

  try {
    console.log(payload);

    const result = await login_service.verifyLogin(payload);

    if (!result) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(payload.password, result.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: result._id, email: result.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
    );

    const { password: _, ...userData } = result;
    return res
      .status(200)
      .json({ message: "Login Successful", user: userData, token });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error occurred", error: err.message });
  }
};

const login_controllers = {
  verifyLogin,
};

export default login_controllers;
