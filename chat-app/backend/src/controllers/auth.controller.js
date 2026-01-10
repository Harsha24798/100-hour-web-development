import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signin = async (req, res) => {
  const { fullName, email, password, profilePic } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }

    return res.status(201).json({ newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const signup = (req, res) => {
  res.send("Signup controller");
};

export const logout = (req, res) => {
  res.send("Logout controller");
};
