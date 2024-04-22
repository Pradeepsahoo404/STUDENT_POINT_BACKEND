const Post = require("../models/post.js")

exports.createPost = async (req, res) => {
    try {
        const _id = req.user;
        const postData = req.body;

        if (!postData.title || !postData.body || !postData.status || !postData.latitude || !postData.longitude) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newPost = new Post({...postData , createdBy : _id});
        await newPost.save();

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: newPost 
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error while creating the post"
        });
    }
};


exports.getAllPost = async(req , res) => {
    try{
        const userID = req.user._id
        console.log(userID)
        const postList = await Post.find({createdBy : userID})
        if(postList !== 0){
            return res.status(201).json({
                success: true,
                message: "Successfully got all data",
                data: postList 
            });
        }  else {
            return res.status(404).json({
                success: false,
                message: "No posts found"
            });
        }

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "cannot get post data"
        });
    }
}

exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const data = req.body;

        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: "Invalid post ID"
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                $set: {
                    title: data.title,
                    body: data.body,
                    status: data.status,
                    longitude: data.longitude,
                    latitude: data.latitude
                }
            },
            { new: true } 
        );

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: updatedPost
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the post"
        });
    }
};


exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const postToDelete = await Post.findById(postId);

        if (!postToDelete) {
            return res.status(404).json({
                success: false,
                message: "Invalid post ID"
            });
        }

        await Post.findByIdAndDelete(postId);

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the post"
        });
    }
};


exports.postCount = async (req, res) => {
    try {
        const activeCount = await Post.countDocuments({ status: 'Active' });
        const inactiveCount = await Post.countDocuments({ status: 'InActive' });

        const data = {
            activeCount : activeCount,
            inactiveCount : inactiveCount
        }
        return res.status(200).json({
            success: true,
            message: "Post Count",
            data: data
        });
    }  catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve post count"
        });
    }};

exports.retrievePostsByLocation = async(req, res)=> {
    try{
        const {latitude ,longitude} = req.params

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Please enter latitude and longitude"
            });
        }

        const posts = await Post.find({
            latitude: { $eq: parseFloat(latitude) },
            longitude: { $eq: parseFloat(longitude) },
        });

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No posts found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Post found",
            data: posts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve post Data by longitude and latitude"
        });
    }};