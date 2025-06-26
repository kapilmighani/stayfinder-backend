import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import errorHandler from "./middleware/errorhandler.js";

const app = express();
const mongourl = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8000;

// MongoDB Connection
mongoose
  .connect(mongourl)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// CORS for frontend access
app.use(cors({
  origin: "https://stayfinder-frondend-syhd.vercel.app",
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// Routes
app.use(authRoutes);
app.use(listingRoutes);
app.use(bookingRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(8000, () => {
  console.log("Server running");
});

