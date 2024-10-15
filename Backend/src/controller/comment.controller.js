import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../model/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//TODO: get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
     
    const skip = (page - 1) * limit

    const comments = await Comment.find(
        {
            video: videoId
        }
       ).skip(skip).limit(limit)

    return res.status(200)
              .json(
                 new ApiResponse(200, comments, "Comments fetched successfully")
              )
})



// TODO: add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    const newComment = await Comment.create({
         video: videoId,
         content,
         owner: req.user?._id
    })

    if (!newComment) {
        throw new ApiError(400, "newComment is required")
    }

    return res.status(200)
              .json(
                 new ApiResponse(200, newComment, "newComment created successfully")
              )
})



// TODO: update a comment
const updateComment = asyncHandler(async (req, res) => {
     const { commentId } = req.params
     const { content } = req.body

     if (!content) {
        throw new ApiError(400, "content is required")
     }

     if (!commentId) {
        throw new ApiError(400, "commentId is required or Invalid")
     }

     const commentUpdated = await Comment.findByIdAndUpdate(commentId, 
          {
            $set: {
                content: content
            }
          },
          {
            new: true
          }
     )

     if (!commentUpdated) {
        throw new ApiError(400, "Issue whille updating commentUpdated")
     }

     return res.status(200)
                .json(
                    new ApiResponse(200, commentUpdated, "comment updated successfully")
                )
})



// TODO: delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "commentId is required")
    }

    const commentDeleted = await Comment.findByIdAndDelete(commentId)

    if (!commentDeleted) {
       throw new ApiError(404, "Comment not found")
    }

    return res.status(200)
                .json(
                    new ApiResponse(200, {}, "comment deleted successfully")
                )

})


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }