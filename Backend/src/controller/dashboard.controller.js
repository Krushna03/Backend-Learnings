import mongoose from "mongoose"
import {Video} from "../model/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../model/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(404, "userId not found")
    }

    const channeStats = await Video.aggregate([
          {
             $match: {
                owner: userId,
            },
          },
          // Lookup for the Subscribers of a channel
          { 
            $lookup: {
               from: "subscriptions",
               localField: "owner",
               foreignField: "channel",
               as: "subscribers"
            }
          },
          // Lookup for channel which the owner subscribed 
          {
             $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "subscriber",
                as: "subscribedTo"
             }
          },
          // Lookup likes for the user's videos
          { 
             $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likedVideos"
             }
          },
          // Lookup comments for the user's videos
          {
             $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "VideoComments"
             }
          },
          // Lookup tweets by the user
          {
             $lookup: {
               from: "tweets",
               localField: "owner",
               foreignField: "owner",
               as: "tweets"
             }
          },
          // Group to calculate the stats
          {
              $group: {
                _id: null,
                totalVideos: { $sum : 1 },
                totalViews: { $sum : "$views" },
                susbcribers: { $first: "$subscribers" },
                susbcribedTo: { $first: "$subscribedTo" },
                totalLikes: { $sum: { $size: "$likedVideos"}}, 
                totalComments: { $sum: { $size: "$VideoComments"}},
                totalTweets: { $sum: { $size: '$tweets'}}
              }
          },
           // Project the desired fields
          {
            $project: {
              _id: 0,
              totalVideos: 1,
              totalViews: 1,
              subscribers: { $size: "$subscribers" },
              subscribedTo: { $size: "$subscribedTo" },
              totalLikes: 1,
              totalComments: 1,
              totalTweets: 1,
            },
          }, 
        ]
    )


    return res.status(200)
              .json(
                 new ApiResponse(200, channeStats[0], "Channel stats fetched successfully")
              )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(404, "userId not found")
    }

    const videos = await Video.find({
        owner: userId
    })

    if (!videos.length) {
        return res.status(200)
                  .json( 
                    new ApiResponse(404, [], "videos not found")
                )
    }

    return res.status(200)
              .json( 
                new ApiResponse(200, videos, "Total videos fetched successfully")
              )
})


export {
    getChannelStats, 
    getChannelVideos
  }