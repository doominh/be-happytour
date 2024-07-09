const Trip = require("../models/trip");
const Tour = require("../models/tour");
const Booking = require("../models/booking");
const asyncHandler = require("express-async-handler");

const createTrip = asyncHandler(async (req, res) => {
  const { tourId, vehicel, licensePlate } = req.body;
  if (!tourId || !vehicel || !licensePlate) throw new Error("Missing inputs");
  // check trùng licensePlate
  const existingTrip = await Trip.findOne({ licensePlate });
  if (existingTrip) throw new Error("This trip already exists");

  // Tạo trip mới nếu không trùng
  const response = await Trip.create({ tour: tourId, vehicel, licensePlate });
  await Tour.findByIdAndUpdate(tourId, { $push: { trip: response._id } });
  return res.json({
    success: response ? true : false,
    createdTrip: response ? response : "Cannot create new trip",
  });
});

const getTrips = asyncHandler(async (req, res) => {
  const response = await Trip.find();
  return res.json({
    success: response ? true : false,
    trips: response ? response : "Cannot get trip",
  });
});

const updateTrip = asyncHandler(async (req, res) => {
  const { trid } = req.params;
  const response = await Trip.findByIdAndUpdate(trid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedTrip: response ? response : "Cannot update trip",
  });
});

const deleteTrip = asyncHandler(async (req, res) => {
  const { trid } = req.params;
  await Booking.updateMany({ trip: trid }, { trip: null });
  await Tour.updateMany({ trip: trid }, { $pull: { trip: trid } });
  const response = await Trip.findByIdAndDelete(trid);
  return res.json({
    success: response ? true : false,
    deleteTrip: response ? response : "Cannot delete trip",
  });
});

module.exports = {
  createTrip,
  getTrips,
  updateTrip,
  deleteTrip,
};
