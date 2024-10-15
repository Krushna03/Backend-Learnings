import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../model/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, destroyCloudImage, destroyCloudVideo} from "../utils/cloudinary.js"


//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = 1, userId } = req.query

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "UserId not found")
    }

    if (userId) {
       matchCondition.owner = new mongoose.Types.ObjectId(userId) 
    }

    let videoAggregate;

    try {
       videoAggregate = await Video.aggregate(
         [
           {
            $match: {
                $or: [
                  { title: { $regex: query, $options: "i" }},
                  { description: { $regex: query, $options: "i" } }
                ]
              }
           },
           {
              $lookup: {
                 from: 'users',
                 localField: "owner",
                 foreignField: "_id",
                 as: "owner",
                 pipeline: [
                    {
                        $project: {
                            _id :1,
                            fullName: 1,
                            avatar: "$avatar.url",
                            username: 1, 
                        }
                    }
                 ]
              }
           },
           {
              $addFields: {
                 owner: {
                    $first: "$owner"
                 }
              }
           },
           {
               $project: {
                 title: 1,
                 description: 1,
                 createdAt: 1,
               }
           },
           {
              $sort: {
                [sortBy || "createdAt" ] : sortType || 1
              }
           }
         ]
       )
    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error in video aggregation"); 
    }

    const options = {
        page,
        limit,
        customLabels: {
        totalDocs: "totalVideos",
        docs: "videos"
       },
       skip: (page - 1) * limit,
       limit: parseInt(limit)     
    }

    Video.aggregatePaginate(videoAggregate, options)
    .then(result => {
        if (result?.videos?.length === 0 && userId) {
            return res.status(200).json(new ApiResponse(200, [], "No videos found"))
        }

        return res.status(200)
                  .json(new ApiResponse(200, result, "Video fetched successfully"))
    })
    .catch(error => {
        throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
    })
})



// TODO: get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if (!title && !description) {
        throw new ApiError(400, "Please provide title & description")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath && !thumbnailLocalPath) {
        throw new ApiError(400, "Please provide video & thumbnail")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!video && !thumbnail) {
        throw new ApiError(400, "video & thumbnail not found")
    }

    const videoPublished = await Video.create({
        title,
        description,
        videoFile: {
            url: video.secure_url,
            public_id: video.public_id
        },
        thumbnail: {
            url: thumbnail.secure_url,
            public_id: thumbnail.public_id
        },
        duration: video.duration,
        owner: req.user?._id
    })

    return res.status(200)
              .json(new ApiResponse(200, videoPublished, "Video published successfully"))
})



//TODO: get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "video not found")
    }

    return res.status(200)
              .json(new ApiResponse(200, video, "Video fetched successfully"))
})



//TODO: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
  
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId not found")
    }

    const updateVideoData = {
        title: req.body.title,
        descritpion: req.body.description
    }

    const video = await Video.findById(videoId)

    if (req.file.path !== "") {
        await destroyCloudImage(video.thumbnail.public_id)
    }

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is missing")
    }

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnailLocalPath.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    updateVideoData.thumbnail = {
        public_id: thumbnailUpload.public_id,
        url: thumbnailUpload.secure_url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
         videoId, 
         updateVideoData, 
        {
          new: true
        }
    )

    return res.status(200)
              .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})



//TODO: delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId not found")
    }

    try {
        const video = await Video.findById(videoId)
    
        await destroyCloudImage(video.thumbnail.public_id)
        await destroyCloudVideo(video.videoFile.public_id)
    
        await Video.findByIdAndDelete(videoId)

    } catch (error) {
       throw new ApiError(400, "Error while deleting the video") 
    }

    return res.status(200)
              .json(new ApiResponse(200, {}, "Video deleted successfully"))
})



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(401, "Video not found") 
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200)
              .json(new ApiResponse(200, video, "isPublished toggle successfully"))
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}