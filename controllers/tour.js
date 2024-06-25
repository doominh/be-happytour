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
  const queries = { ...req.query };
  // Tách các trường đặc biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  // Format lại các operators cho đúng cú pháp của mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  // Filtering
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };
  let queryCommand = Tour.find(formatedQueries);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }
  // Pagination
  // limit: số object lấy về 1 lần gọi API trong 1 trang
  // Skip: 2 => bỏ qua 2 object đầu tiên
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Execute query
  // Số lượng sp thỏa mãn điều kiện !== số lượng sp trả về 1 lần gọi API
  try {
    const response = await queryCommand.exec();
    const counts = await Tour.find(formatedQueries).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      toursData: response ? response : "Cannot get tours",
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

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, tid } = req.body;
  if (!star || !tid) throw new Error("Missing inputs");
  const ratingTour = await Tour.findById(tid);
  const alreadyRating = ratingTour?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  );
  if (alreadyRating) {
    // Update star & comment
    await Tour.updateOne(
      // {ratings: { $elemMatch: alreadyRating }}

      {
        _id: tid,
        "ratings._id": alreadyRating._id, // Tìm phần tử cụ thể trong mảng ratings
      }
      ,
      {
        $set: { "ratings.$.star": star, "ratings.$.comment": comment },
      },
      { new: true }
    );
  } else {
    // Add star & comment
    const response = await Tour.findByIdAndUpdate(
      tid,
      {
        $push: { ratings: { star, comment, postedBy: _id } },
      },
      { new: true }
    );
    console.log(response);
  }

  return res.status(200).json({
    success: true,
  });
});

module.exports = {
  createTour,
  getTour,
  getTours,
  updateTour,
  deleteTour,
  ratings,
};
