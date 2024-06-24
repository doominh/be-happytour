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
  const queries = {...req.query};
  // Tách các trường đặc biệt ra khỏi query
  const excludeFields = ['limit', 'sort', 'page', 'fields'];
  excludeFields.forEach(el => delete queries[el]);

  // Format lại các operators cho đúng cú pháp của mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`);
  const formatedQueries = JSON.parse(queryString);

  // Filtering
  if (queries?.name) formatedQueries.name = {$regex: queries.name, $options: 'i'}
  let queryCommand = Tour.find(formatedQueries)

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    queryCommand = queryCommand.sort(sortBy);
  }

  // Execute query
  // Số lượng sp thỏa mãn điều kiện !== số lượng sp trả về 1 lần gọi API
  try {
    const response = await queryCommand.exec();
    const counts = await Tour.find(formatedQueries).countDocuments()
    return res.status(200).json({
      success: response ? true : false,
      toursData: response ? response : "Cannot get tours",
      counts,
    });
  } catch (err) {
    throw new Error(err.message);
  }
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
