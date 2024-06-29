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
    images: {
      type: Array,
    },
    ratings: [
      {
        star: { type: Number, required: true },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: { type: String },
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    tour_active: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Tour_active",
      }
    ],
    destination: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Destination",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Tour", tourSchema);
