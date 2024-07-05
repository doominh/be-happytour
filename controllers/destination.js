const Destination = require("../models/destination");
const Tour = require("../models/tour");
const asyncHandler = require("express-async-handler");

const createDesti = asyncHandler(async (req, res) => {
  const { tourId, name, description, hotel, address } = req.body;
  if (!tourId | !name | !description | !hotel | !address)
    throw new Error("Missing inputs");
  const response = await Destination.create({
    tour: tourId,
    name,
    description,
    hotel,
    address,
  });
  await Tour.findByIdAndUpdate(tourId, {
    $push: { destination: response._id },
  });
  return res.json({
    success: response ? true : false,
    createdDesti: response ? response : "Cannot create new destination",
  });
});

const getDestis = asyncHandler(async (req, res) => {
  const response = await Destination.find();
  return res.json({
    success: response ? true : false,
    destinationsData: response ? response : "Cannot get destinations",
  });
});

const updateDesti = asyncHandler(async (req, res) => {
  const { did } = req.params;
  const response = await Destination.findByIdAndUpdate(did, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedDestination: response ? response : "Cannot update destination",
  });
});

const deleteDesti = asyncHandler(async (req, res) => {
    const { did } = req.params;
    const response = await Destination.findByIdAndDelete(did);
    await Tour.updateMany({destination: did}, {$pull: {destination: did}});
    return res.json({
      success: response ? true : false,
      deleteDestination: response ? response : "Cannot delete destination",
    });
  });
module.exports = {
  createDesti,
  getDestis,
  updateDesti,
  deleteDesti,
};
