import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
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

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, email, oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    // If email is being changed, check if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email is already in use by another user" });
      }
    }

    // If password is being changed, verify old password
    if (newPassword) {
      if (!oldPassword) {
        return res
          .status(400)
          .json({ message: "Old password is required to set a new password" });
      }

      const user = await User.findById(userId);
      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePic: profilePic || req.user.profilePic,
          fullName: fullName || req.user.fullName,
          email: email || req.user.email,
          password: hashedPassword,
        },
        { new: true }
      ).select("-password");

      return res.status(200).json(updatedUser);
    }

    // Update without password change
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: profilePic || req.user.profilePic,
        fullName: fullName || req.user.fullName,
        email: email || req.user.email,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
