import {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../model/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "channelId not found")
    }

    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    if (subscription) {
        await subscription.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Subscription Removed Successfully"))
    }

    const createSubscription = await Subscription.create({
         subscriber: req.user?._id,
         channel: channelId
    })

    return res.status(200)
              .json(new ApiResponse(200, createSubscription, "Subscription created Successfully"))
})



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "channelId not found")
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "fullName email username avatar coverImage")

    if (!subscribers) {
        throw new ApiError(401,"Subscribers not found")
    }

    return res.status(200)
              .json(new ApiResponse(200, subscribers, "Subscribers are fetched successfully"))
})




// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "subscribedId not found")
    }

    const subscribedChannels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "fullName email username avatar coverImage")

    if (!subscribedChannels) {
        throw new ApiError(401,"subscribedChannels not found")
    }

    return res.status(200)
              .json(new ApiResponse(200, subscribedChannels, "Subscribers are fetched successfully"))
})




export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}




// Subscription.find({ channel: channelId }):

// This query finds all subscription documents in the Subscription collection where the channel field matches the channelId provided in the request parameters. Essentially, it retrieves all subscriptions related to the specified channel.


// .populate("subscriber", "fullName email username avatar coverImage"):

// The populate method is used to replace the subscriber field in the found subscription documents with the actual user documents from the User collection.
// "subscriber": This is the field in the Subscription schema that holds the reference to a User document (likely an ObjectId).
// "fullName email username avatar coverImage": These are the specific fields from the User documents that you want to include in the result. Only these fields will be populated, and the rest of the User fields will be excluded.