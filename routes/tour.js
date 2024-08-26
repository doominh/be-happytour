const router = require("express").Router();
const ctrls = require("../controllers/tour");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    { name: "images", maxCount: 10 },
    { name: "thumb", maxCount: 1 },
  ]),
  ctrls.createTour
);
router.get("/", ctrls.getTours);
router.put("/ratings", verifyAccessToken, ctrls.ratings);

router.put(
  "/uploadimage/:tid",
  [verifyAccessToken, isAdmin],
  uploader.array("images", 10),
  ctrls.uploadImagesTour
);
router.put("/:tid", [verifyAccessToken, isAdmin], ctrls.updateTour);
router.delete("/:tid", [verifyAccessToken, isAdmin], ctrls.deleteTour);
router.get("/:tid", ctrls.getTour);

module.exports = router;
