const router = require("express").Router();
const ctrls = require("../controllers/destination");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrls.createDesti);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getDestis);

router.put("/:did", [verifyAccessToken, isAdmin], ctrls.updateDesti);
router.delete("/:did", [verifyAccessToken, isAdmin], ctrls.deleteDesti);

module.exports = router;
