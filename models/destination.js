const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var destinationSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Types.ObjectId,
    ref: "Tour",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  hotel: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

//Export the model
module.exports = mongoose.model("Destination", destinationSchema);
