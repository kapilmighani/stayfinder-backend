import express from "express";
import {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  getmylisting,
  searchListings
} from "../controllers/listingController.js";

import upload from "../middleware/upload.js";
import { isAuthenticated, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/createlisting",
  isAuthenticated,
  authorizeRoles("host"),
  upload.single("image"),
  createListing
);

router.put(
  "/updatelisting/:id",
  isAuthenticated,
  authorizeRoles("host"),
  updateListing
);

router.delete(
  "/deletelisting/:id",
  isAuthenticated,
  authorizeRoles("host"),
  deleteListing
);

router.get(
  "/mylisting",
  isAuthenticated,
  authorizeRoles("host"),
  getmylisting
);

router.get("/showlisting", getAllListings);
router.get("/listing/:id", getSingleListing);
router.get("/search", searchListings);

export default router;