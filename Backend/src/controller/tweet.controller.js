import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../model/tweets.model.js"
import {User} from "../model/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (content?.trim() === "") {
    throw new ApiError(400, 'Content field is required')
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!newTweet) {
      throw new ApiError(401, "Tweet is not created")
    }
         
    return res.status(200)
              .json( new ApiResponse(200, newTweet, "Tweet created successfully"))
})



const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.find({
        owner: userId
    })

    if (!tweets) {
        throw new ApiError(401, "Tweets not get")
    }
           
    return res.status(200)
                .json( new ApiResponse(200, tweets, "tweets fetched successfully"))
})


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(401, "Content is required")
    }
    if (!tweetId) {
        throw new ApiError(401, "tweetId is required")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, 
        { 
          $set: {
            content
          }
        },
        {
            new: true
        }
    )

    if (!updatedTweet) {
        throw new ApiError(401, "Tweet not updated")
    }

    return res.status(200)
              .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})



const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
     const { tweetId } = req.params

     const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    
     if (!deletedTweet) {
        throw new ApiError(401, "Issue while deleting a tweet")
     }

     return res.status(200)
               .json(new ApiResponse(200, {}, "Tweet DELETED- successfully"))
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}