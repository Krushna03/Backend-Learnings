import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../model/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//TODO: create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name or Description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id 
    })

    if (!playlist) {
        throw new ApiError(400, "No playlist found")
    }

    return res.status(200)
              .json(new ApiResponse(200, playlist, "Playlist craeted successfully"))
})



const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const {userId} = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "No userId found")
    }

    const userPlaylists = await Playlist.find({ owner: userId })

    if (!userPlaylists) {
        throw new ApiError(400, "playlists does not found")
    }

    return res.status(200)
              .json(new ApiError(200, userPlaylists, "userPlaylists fetched successfully"))
})




const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "No playlistId found")
    }

    const getPlaylist = await Playlist.findById(playlistId)

    if (!getPlaylist) {
        throw new ApiError(400, "getPlaylist does not found")
    }

    return res.status(200)
              .json(new ApiError(200, getPlaylist, "getPlaylist fetched successfully"))
})



const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "videoId required")
    }

    if (isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId required")
    }

    const videoAddedToPlaylist = await Playlist.findByIdAndUpdate(playlistId, 
        {
           $push: {
              videos: videoId
           },
        },
        {
           new: true,
           useFindAndModify: false
        }
    )

    if (!videoAddedToPlaylist) {
        throw new ApiError(400, "videoAddedToPlaylist does not found")
    }

    return res.status(200)
              .json(new ApiError(200, videoAddedToPlaylist, "videoAddedToPlaylist added successfully"))
})



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.params
      
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "videoId required")
    }

    if (isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId required")
    }

    const videoRemoved = await Playlist.findByIdAndUpdate(playlistId, 
        {
           $pull:{
              video: videoId
           }
        },
        {
           new: true
        }
    )

    if (!videoRemoved) {
        throw new ApiError(400, "videoRemoved does not found")
    }

    return res.status(200)
              .json(new ApiError(200, videoRemoved, "videoRemoved added successfully")) 
})



const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlistId is required")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({ _id: playlistId })

    if (!deletedPlaylist) {
        throw new ApiError(400, "deletedPlaylist does not found")
    }

    return res.status(200)
              .json(new ApiError(200, {}, "deleted Playlist successfully"))
})



const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlistId required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "updatedPlaylist does not found")
    }

    return res.status(200)
              .json(new ApiError(200, updatedPlaylist, " Playlist updated successfully"))

})



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}