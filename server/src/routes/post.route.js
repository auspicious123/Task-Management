const express = require("express");
const router = express.Router();
const {
  createNewPost,
  GetAllPost,
  DeletePost,
  updateStatus,
} = require("../controllers/post.controller");

router.post("/create", createNewPost);
router.post("/updateStatus", updateStatus);
router.post("/delete", DeletePost);
router.get("/getall", GetAllPost);

module.exports = router;
