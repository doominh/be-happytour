const TourCategory = require("../models/tourCategory");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const response = await TourCategory.create(req.body);
  return res.json({
    success: response ? true : false,
    createdCategory: response ? response : "Cannot create new tour-category",
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const response = await TourCategory.find(req.body).select("name _id");
  return res.json({
    success: response ? true : false,
    tourCategories: response ? response : "Cannot get tour-categories",
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { tcid } = req.params;
  const response = await TourCategory.findByIdAndUpdate(tcid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : "Cannot update tour-category",
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { tcid } = req.params;
  const response = await TourCategory.findByIdAndDelete(tcid);
  return res.json({
    success: response ? true : false,
    deleteCategory: response ? response : "Cannot delete tour-categories",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
