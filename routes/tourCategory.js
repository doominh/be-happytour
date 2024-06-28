const router = require("express").Router();
const ctrls = require("../controllers/tourCategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrls.createCategory);
router.get("/", ctrls.getCategories);
router.put("/:tcid", [verifyAccessToken, isAdmin], ctrls.updateCategory);
router.delete("/:tcid", [verifyAccessToken, isAdmin], ctrls.deleteCategory);

module.exports = router;
