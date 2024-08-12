const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    thumb: {
      type: String,
    },
    sold: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    images: {
      type: Array,
    },
    ratings: [
      {
        star: { type: Number, required: true },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: { type: String },
        updatedAt: { type: Date },
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "TourCategory",
    },
    trip: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Trip",
      },
    ],
    booking: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Booking",
      },
    ],
    destination: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Destination",
      },
    ],
    tourType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Tour", tourSchema);
