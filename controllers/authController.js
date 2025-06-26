import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const registerUser = async (req, res) => {
  const { name, username, role, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = generateToken();
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
      name,
      username,
      role,
      email,
      password: hashedPassword,
      verificationToken: token,
      verificationTokenExpires: tokenExpires,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      role: user.role,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Signup error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = generateToken();
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Login error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });

    const user = await User.findOne({ verificationToken: token });
    if (user) {
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      await user.save();
    }

    res.json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Logout error" });
  }
};

export const checkAuth = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ authenticated: false });

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) return res.json({ authenticated: false });

  res.json({
    authenticated: true,
    userId: user._id,
    role: user.role,
  });
};
