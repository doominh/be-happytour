const router = require("express").Router();
const ctrls = require("../controllers/booking");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createBooking);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getBookings);
router.get("/current", verifyAccessToken, ctrls.getUserBooking);

router.put("/status/:bid", [verifyAccessToken], ctrls.updateStatus);

module.exports = router;
