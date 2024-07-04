const router = require("express").Router();
const ctrls = require("../controllers/trip");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrls.createTrip);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getTrips);


router.put("/:trid", [verifyAccessToken, isAdmin], ctrls.updateTrip);
router.delete("/:trid", [verifyAccessToken, isAdmin], ctrls.deleteTrip);

module.exports = router;
