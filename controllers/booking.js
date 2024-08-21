const Booking = require("../models/booking");
const Tour = require("../models/tour");
const User = require("../models/user");
const Trip = require("../models/trip");
const asyncHandler = require("express-async-handler");

// client gửi tid, adult > từ tid móc price từ Tour
function calculateTotalPrice(adult, children, infant, tourPrice) {
  let totalPrice = 0;

  // Giá cho người lớn
  totalPrice += adult * tourPrice;

  // Giá cho trẻ em từ 4 đến dưới 10 tuổi
  totalPrice += children * 0.75 * tourPrice; // 75% giá vé người lớn

  // Trẻ em dưới 4 tuổi miễn phí
  totalPrice += infant * 0; // Miễn phí

  return Math.round(totalPrice / 1000) * 1000;
}
const createBooking = asyncHandler(async (req, res) => {
  const { tourId, tripId, adult, children, infant, address } = req.body;
  if (!tourId || !adult) throw new Error("Missing inputs");
  const { _id } = req.user;
  if (address) {
    await User.findByIdAndUpdate(_id, { address });
  }
  const tour = await Tour.findById(tourId);
  const tourPrice = tour?.price;
  // Gán giá trị mặc định nếu không có trong yêu cầu
  const validChildren = children !== undefined ? children : 0;
  const validInfant = infant !== undefined ? infant : 0;

  // Tính tổng giá trị đặt chỗ
  const total = calculateTotalPrice(
    adult,
    validChildren,
    validInfant,
    tourPrice
  );

  // Tạo đối tượng đặt chỗ mới
  const booking = new Booking({
    tour: tourId,
    trip: tripId,
    adult,
    children: validChildren,
    infant: validInfant,
    total,
    orderBy: _id,
  });

  // Lưu đối tượng đặt chỗ vào cơ sở dữ liệu
  await booking.save();

  // Cập nhật bảng Tour, User và Trip với booking mới
  await tour.updateOne({ $push: { booking: booking._id }, $inc: { sold: 1 } });
  await User.findByIdAndUpdate(_id, { $push: { booking: booking._id } });
  await Trip.findByIdAndUpdate(tripId, { $push: { booking: booking._id } });

  return res.status(200).json({
    success: booking ? true : false,
    bookingData: booking ? booking : "Cannot create booking",
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const { status } = req.body;
  if (!status) throw new Error("Missing status");
  const response = await Booking.findByIdAndUpdate(
    bid,
    { status },
    { new: true }
  );
  return res.json({
    success: response ? true : false,
    response: response ? response : "Something went wrong",
  });
});

const getUserBooking = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const response = await Booking.find({ orderBy: _id })
    .populate("tour", "name price")
    .populate("trip", "vehicel licensePlate");
  res.status(200).json({
    success: response ? true : false,
    bookingData: response ? response : "Cannot get user's booking list",
  });
});

const getBookings = asyncHandler(async (req, res) => {
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

  // // Filtering
  // if (queries?.name)
  //   formatedQueries.name = { $regex: queries.name, $options: "i" };
  let queryCommand = Booking.find(formatedQueries)
    .populate("tour", "name price")
    .populate("trip", "vehicel licensePlate")
    .populate("orderBy", "firstname lastname mobile");
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
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_BOOKINGS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  queryCommand = queryCommand.populate("orderBy", "firstname lastname");
  try {
    const response = await queryCommand.exec();
    const counts = await Booking.find(formatedQueries).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      bookingsData: response ? response : "Cannot get bookings",
    });
  } catch (err) {
    throw new Error(err.message);
  }
});

module.exports = {
  createBooking,
  getUserBooking,
  getBookings,
  updateStatus,
};
