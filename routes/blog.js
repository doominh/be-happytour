const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const ctrls = require("../controllers/blog");

router.get("/", ctrls.getBlogs);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createNewBlog);
router.put("/like/:blogId", [verifyAccessToken], ctrls.likeBlog);
router.put("/dislike/:blogId", [verifyAccessToken], ctrls.dislikeBlog);
router.put("/:blogId", [verifyAccessToken, isAdmin], ctrls.updateBlog);
router.delete("/:blogId", [verifyAccessToken, isAdmin], ctrls.deleteBlog);

module.exports = router;
