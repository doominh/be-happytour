const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
    },
    trip: {
      type: mongoose.Types.ObjectId,
      ref: "Trip",
    },
    status: {
      type: String,
      default: "Cancelled",
      enum: ["Cancelled", "Processing", "Success"],
    },
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    adult: {
      type: Number,
      required: true,
    },
    children: {
      type: Number,
      default: 0,
    },
    infant: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Booking", bookingSchema);
