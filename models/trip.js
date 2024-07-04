const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var tripSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Types.ObjectId,
    ref: "Tour",
  },
  booking: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Booking",
    },
  ],
  vehicel: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
  },
});

//Export the model
module.exports = mongoose.model("Trip", tripSchema);
