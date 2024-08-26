const Tour = require("../models/tour");
const Booking = require("../models/booking");
const Trip = require("../models/trip");
const Destination = require("../models/destination");
const TourCategory = require("../models/tourCategory");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createTour = asyncHandler(async (req, res) => {
  const {name, price, description,category, tourType} = req.body;
  const thumb = req.files?.thumb[0].path;
  const images = req.files?.images?.map(el => el.path);
  if (!(name, price, description, category, tourType)) throw new Error("Missing inputs");
  req.body.slug = slugify(req.body.name);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;
  const newTour = await Tour.create(req.body);
  return res.status(200).json({
    success: newTour ? true : false,
    createdTour: newTour ? newTour : "Cannot create new tour",
  });
});

const getTour = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  const tour = await Tour.findById(tid)
    .populate("trip", "vehicel licensePlate departureTime")
    .populate("destination", "name description hotel address")
    .populate("category", "name")
    .populate({
      path: "ratings",
      populate: { path: "postedBy", select: "firstname lastname avatar" },
    })
    .select("-booking");
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

  let tourTypeQueryObject = {};
  // Filtering
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };
  if (queries?.category) {
    const category = await TourCategory.findOne({
      name: { $regex: queries.category, $options: "i" },
    }).select("_id");
    if (category) formatedQueries.category = category._id;
  }
  if (queries?.tourType) {
    delete formatedQueries.tourType;
    const tourTypeArr = queries.tourType?.split(",");
    const tourTypeQuery = tourTypeArr.map((el) => ({
      tourType: { $regex: el, $options: "i" },
    }));
    tourTypeQueryObject = { $or: tourTypeQuery };
  }
  const allFormatedQueries = { ...tourTypeQueryObject, ...formatedQueries };
  let queryCommand = Tour.find(allFormatedQueries);

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
  const limit = +req.query.limit || process.env.LIMIT_TOURS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Populate trip and destination fields
  queryCommand = queryCommand.populate("category", "name");
  //   .populate("trip", "vehicle licensePlate")
  //   .populate("destination", "name description hotel address")
  // Execute query
  // Số lượng sp thỏa mãn điều kiện !== số lượng sp trả về 1 lần gọi API
  try {
    const response = await queryCommand.exec();
    const counts = await Tour.find(allFormatedQueries).countDocuments();
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
  await Booking.updateMany({ tour: tid }, { tour: null });
  await Trip.updateMany({ tour: tid }, { tour: null });
  await Destination.updateMany({ tour: tid }, { tour: null });
  const deletedTour = await Tour.findByIdAndDelete(tid);
  return res.status(200).json({
    success: deletedTour ? true : false,
    deletedTour: deletedTour ? deletedTour : "Cannot delete tour",
  });
});

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, tid, updatedAt } = req.body;
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
      },
      {
        $set: { "ratings.$.star": star, "ratings.$.comment": comment, "ratings.$.updatedAt": updatedAt },
      },
      { new: true }
    );
  } else {
    // Add star & comment
    await Tour.findByIdAndUpdate(
      tid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    );
  }

  // Sum ratings
  const updatedTour = await Tour.findById(tid);
  const ratingCount = updatedTour.ratings.length;
  const sumRatings = updatedTour.ratings.reduce((sum, el) => sum + +el.star, 0);
  updatedTour.totalRatings = Math.round((sumRatings * 10) / ratingCount) / 10;

  await updatedTour.save();

  return res.status(200).json({
    success: true,
    updatedTour,
  });
});

const uploadImagesTour = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  if (!req.files) throw new Error("Missing inputs");
  const response = await Tour.findByIdAndUpdate(
    tid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    updatedTour: response ? response : "Cannot upload images tour",
  });
});

module.exports = {
  createTour,
  getTour,
  getTours,
  updateTour,
  deleteTour,
  ratings,
  uploadImagesTour,
};
