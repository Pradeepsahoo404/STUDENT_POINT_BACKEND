const express = require("express")
const router = express.Router()

const Post = require("../controllers/Post.controller")
const {auth} = require("../middleware/auth")

router.post("/create" ,  auth , Post.createPost)
router.get("/get-all" ,  auth , Post.getAllPost)
router.put("/update/:id" ,  auth , Post.updatePost)
router.delete("/delete/:id" ,  auth , Post.deletePost)
router.post("/location-post" ,  auth , Post.retrievePostsByLocation)
router.get("/dashboard" ,  auth , Post.postCount)


module.exports = router;