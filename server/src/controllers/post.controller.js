const Post = require("../models/post.model");

const { ACCESS_DENIED_ERR } = require("../errors");

// --------------------- create new Post ---------------------------------

module.exports = {
  createNewPost: async (req, res, next) => {
    try {
      let { title, description, status } = req.body;

      const existingPost = await Post.findOne({ title });
      if (existingPost) {
        const updatedPost = await Post.updateOne(
          { _id: existingPost._id },
          { $set: { title: title, description: description, status } }
        );

        console.log("Post updated successfully:", updatedPost);
        res
          .status(200)
          .json({ message: "Post updated successfully", data: existingPost });
      } else {
        // create new Post
        const createPost = new Post({
          title,
          description,
          status,
        });
        const newPost = await createPost.save();
        console.log("Post", newPost);

        // save Post
        res.status(200).json({
          type: "success",
          message: "Post Created successfully",
          data: {
            createPost,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  },
  GetAllPost: async (req, res, next) => {
    try {
      const allPosts = await Post.find();
      if (allPosts) {
        res.status(200).json({
          type: "success",
          message: "These Posts found",
          allPosts,
        });
      } else {
        res.status(404).json({
          type: "error",
          message: "Post not found",
        });
      }
    } catch (error) {
      next(error);
    }
  },
  DeletePost: async (req, res, next) => {
    try {
      let { _id } = req.body;
      console.log("_id to delete", _id);
      const existingPost = await Post.findOneAndDelete({ _id });
      console.log("deleted", existingPost);
      if (existingPost) {
        res.status(200).json({
          type: "success",
          message: "Post deleted successfully",
          existingPost,
        });
      } else {
        res.status(404).json({
          type: "error",
          message: "Post not found",
        });
      }
    } catch (error) {
      next(error);
    }
  },
  updateStatus: async (req, res, next) => {
    try {
      let { taskId, status, title, description } = req.body;
      console.log("taskId received", taskId);
      const existingPost = await Post.updateOne(
        { _id: taskId },
        {
          $set: {
            status: status,
            title: title,
            description: description,
          },
        }
      );
      if (existingPost) {
        res.status(200).json({
          type: "success",
          message: "Post updated successfully",
          existingPost,
        });
      } else {
        res.status(404).json({
          type: "error",
          message: "Post not found",
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
