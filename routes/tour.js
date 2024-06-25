const router = require("express").Router();
const ctrls = require("../controllers/tour");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrls.createTour);
router.get("/", ctrls.getTours);
router.put("/ratings", verifyAccessToken, ctrls.ratings);

router.put("/:tid", [verifyAccessToken, isAdmin], ctrls.updateTour);
router.delete("/:tid", [verifyAccessToken, isAdmin], ctrls.deleteTour);
router.get("/:tid", ctrls.getTour);

module.exports = router;
