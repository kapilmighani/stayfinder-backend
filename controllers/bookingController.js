import Booking from "../models/booking.js";


export const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { listing, checkIn, checkOut, guests, totalPrice } = req.body;

    if (!listing || !checkIn || !checkOut || !guests || !totalPrice) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    const booking = await Booking.create({
      user: userId,
      listing,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error("Booking failed:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};


export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate("listing");
    res.json({ bookings });
  } catch (err) {
    console.error("Fetching bookings error:", err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};
