import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to set cookies consistently
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: process.env.COOKIE_DOMAIN // Uncomment if you need specific domain
  });
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
    const user = await User.create({
      name,
      username,
      role,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { 
      expiresIn: "7d" 
    });
    
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
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

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { 
      expiresIn: "1d" 
    });

    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: "Login successful",
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

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    // domain: process.env.COOKIE_DOMAIN // Must match original cookie settings
  });
  return res.json({ 
    success: true,
    message: "Logout successful" 
  });
};

export const checkAuth = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ 
      authenticated: false 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ 
      authenticated: true,
      userId: decoded.id,
      role: decoded.role 
    });
  } catch (err) {
    return res.json({ 
      authenticated: false 
    });
  }
};
