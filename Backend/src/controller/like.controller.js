import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../model/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
     const {videoId} = req.params

     if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Video ID is not found")
     }

     const like = await Like.findOne({
            video: videoId,
            likedBy: req.user?._id
       })

     if (like) {
        await like.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Like removed successfully"))
     }

     const likedVideo = await Like.create({
           video: videoId,
           likedBy: req.user?._id
     })

     return res.status(200)
                .json(
                    new ApiResponse(200, likedVideo, "Like added to video successfully"                   
                ))
})



const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "Comment ID is not found")
    }

    const commentlike = await Like.findOne({
         comment: commentId,
         likedBy: req.user?._id
    }) 

    if (commentlike) {
       await commentlike.deleteOne()
       return res.status(200).json(new ApiResponse(200, {}, "Like on comment removed successfully")) 
    } 

    const likedComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res.status(200)
              .json(
                 new ApiResponse(200, likedComment, "Like on comment added successfully"                   
              ))

})



const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Tweet ID is not found")
    }

    const tweetlike = await Like.findOne({
         tweet: tweetId,
         likedBy: req.user?._id
    }) 

    if (tweetlike) {
       await tweetlike.deleteOne()
       return res.status(200).json(new ApiResponse(200, {}, "Like on tweet removed successfully")) 
    } 

    const likedtweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res.status(200)
              .json(
                 new ApiResponse(200, likedtweet, "Like on tweet added successfully"                   
              ))
})



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
     const likes = await Like.find({
         likedBy: req.user?._id,
         video: { $ne: null } //it ensures that only the Like documents that are associated with a valid video (i.e., where the video field is not null) are retrieved.
       }).populate("video") //The populate("video") part replaces the video field (which normally contains just the ObjectId of the video) with the actual video document from the Video collection.

      //Except null extract all the data from likes array
      const likedVideos = likes.filter(like => like.video).map(like => like.video)
      
      if (likedVideos.length === 0) {
         return res.status(200)
                   .json(new ApiError(404, {}, "You haven't liked any videos yet"))
      }

      return res.status(200)
                .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}