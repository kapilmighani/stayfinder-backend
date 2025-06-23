import Listing from "../models/listing.js";

export const createListing = async (req, res) => {
  const { title, description, price, location, category } = req.body;

  try {
    const newListing = await Listing.create({
      title,
      description,
      image: req.file?.path,
      price,
      location,
      category,
      owner: req.user._id,
    });

    res.status(201).json({ message: "Listing created", newListing });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json({ listings });
  } catch (err) {
    console.error("Get listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

export const getSingleListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    res.json({ listing });
  } catch (err) {
    console.error("Get single listing error:", err);
    res.status(500).json({ message: "Listing not found" });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: Not your listing" });
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: Not your listing" });
    }

    const deleted = await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted", deleted });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getmylisting = async (req, res) => {
  try {
    const userId = req.user._id;
    const listings = await Listing.find({ owner: userId });
    res.json({ listings });
  } catch (err) {
    console.error("Fetching my listings error:", err);
    res.status(500).json({ message: "Error fetching listings" });
  }
};

export const searchListings = async (req, res) => {
  const { location, category } = req.query;
  const query = {};

  if (location) query.location = { $regex: location, $options: "i" };
  if (category) query.category = category;

  try {
    const listings = await Listing.find(query);
    res.json({ listings });
  } catch (err) {
    console.error("Search listings error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
