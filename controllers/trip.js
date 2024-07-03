const Trip = require("../models/trip");
const asyncHandler = require("express-async-handler");

const createTrip = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
    if (req.body && req.body.name) req.body.slug = slugify(req.body.name);
    const newTour = await Tour.create(req.body);
    return res.status(200).json({
      success: newTour ? true : false,
      createdTour: newTour ? newTour : "Cannot create new tour",
    });
  });

module.exports = {
    createTrip
}