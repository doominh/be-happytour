const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");

const createNewBlog = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) throw new Error("Missing inputs");
  const response = await Blog.create(req.body);
  return res.json({
    success: response ? true : false,
    createdBlog: response ? response : "Cannot create new blog",
  });
});

const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await Blog.findByIdAndUpdate(blogId, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedBlog: response ? response : "Cannot update blog",
  });
});

const getBlogs = asyncHandler(async (req, res) => {
  const response = await Blog.find();
  return res.json({
    success: response ? true : false,
    blogs: response ? response : "Cannot get blogs",
  });
});

/** 
 * Khi người dùng like 1 bài blog thì :
 1. Check xem người dùng trước đó có dislike hay không => bỏ dislike
 2. Check xem người đó trước đó có like hay không => bỏ like / thêm like
*/
const likeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { blogId } = req.params;
  if (!blogId) throw new Error("Missing inputs");
  const blog = await Blog.findById(blogId);
  const alreadyDisliked = blog?.dislikes?.find((el) => el.toString() === _id);
  if (alreadyDisliked) {
    const response = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { dislikes: _id } },
      { new: true }
    );
  }
  const isLiked = blog?.likes?.find((el) => el.toString() === _id);
  if (isLiked) {
    const response = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { likes: _id } },
      { new: true }
    );
    return res.json({
      success: response ? true : false,
      rs: response,
    });
  } else {
    const response = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { likes: _id } },
      { new: true }
    );
    return res.json({
      success: response ? true : false,
      rs: response,
    });
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { blogId } = req.params;
    if (!blogId) throw new Error("Missing inputs");
    const blog = await Blog.findById(blogId);
    const alreadyLiked = blog?.likes?.find((el) => el.toString() === _id);
    if (alreadyLiked) {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: _id } },
        { new: true }
      );
    }
    const isDisliked = blog?.dislikes?.find((el) => el.toString() === _id);
    if (isDisliked) {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { dislikes: _id } },
        { new: true }
      );
      return res.json({
        success: response ? true : false,
        rs: response,
      });
    } else {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $push: { dislikes: _id } },
        { new: true }
      );
      return res.json({
        success: response ? true : false,
        rs: response,
      });
    }
  });

  const deleteBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    return res.status(200).json({
      success: deletedBlog ? true : false,
      deletedBlog: deletedBlog ? deletedBlog : "Cannot delete blog",
    });
  });

module.exports = {
  createNewBlog,
  updateBlog,
  getBlogs,
  likeBlog,
  dislikeBlog,
  deleteBlog
};
