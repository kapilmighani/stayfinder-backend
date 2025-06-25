import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import errorHandler from "./middleware/errorhandler.js";

const app = express();
const mongourl = process.env.MONGODB_URI;

mongoose
  .connect(mongourl)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

import cors from "cors";

const allowedOrigins = [
  "https://stayfinder-frondend.vercel.app",
  "https://stayfinder-backend-trrx.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or is a Vercel preview URL
      if (
        allowedOrigins.includes(origin) || 
        origin.endsWith(".vercel.app") // For Vercel preview deployments
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Set-Cookie", "Authorization"], // Expose these headers to frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"] // Allowed request headers
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(authRoutes);
app.use(listingRoutes);
app.use(bookingRoutes);
app.use(errorHandler);

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
