const Tour = require("../models/tour");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createTour = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  if (req.body && req.body.name) req.body.slug = slugify(req.body.name);
  const newTour = await Tour.create(req.body);
  return res.status(200).json({
    success: newTour ? true : false,
    createdTour: newTour ? newTour : "Cannot create new tour",
  });
});

const getTour = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  const tour = await Tour.findById(tid);
  return res.status(200).json({
    success: tour ? true : false,
    tourData: tour ? tour : "Cannot get tour",
  });
});

//Filtering, sorting & pagination
const getTours = asyncHandler(async (req, res) => {
  const tours = await Tour.find();
  return res.status(200).json({
    success: tours ? true : false,
    toursData: tours ? tours : "Cannot get tours",
  });
});

const updateTour = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  if (req.body && req.body.name) req.body.slug = slugify(req.body.name);
  const updatedTour = await Tour.findByIdAndUpdate(tid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedTour ? true : false,
    updatedTour: updatedTour ? updatedTour : "Cannot update tour",
  });
});

const deleteTour = asyncHandler(async (req, res) => {
    const { tid } = req.params;
    const deletedTour = await Tour.findByIdAndDelete(tid);
    return res.status(200).json({
      success: deletedTour ? true : false,
      deletedTour: deletedTour ? deletedTour : "Cannot delete tour",
    });
  });

module.exports = {
  createTour,
  getTour,
  getTours,
  updateTour,
  deleteTour,
};
