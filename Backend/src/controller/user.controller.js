import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../model/User.model.js'
import { uploadOnClodinary, destroyCloudImage } from '../utils/cloudinary.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import  jwt  from 'jsonwebtoken'
import mongoose from 'mongoose'


const generateAccessAndRefreshTokens = async (userID) => {
    try {
       const user = await User.findById(userID)

       const accessToken = await user.generateAccessToken()
       const refreshToken = await user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({ validateBeforeSave: false}) //save this without the need to check the password

       return {accessToken, refreshToken}

    } catch (error) {
      throw new ApiError(500, "Something wend wrong while generating access and refresh token")
    }
}



const registerUser = asyncHandler( async (req, res) => {
     
   const {fullName, username, email, password} = req.body
   // console.log(req.body);

   if ([fullName, username, email, password].some((filed) => filed?.trim() === "")) {
      throw new ApiError(400, "All fields are required") 
   }

   const existedUser = await User.findOne({
       $and: [ {username}, {email} ]
   })

   if (existedUser) {
      throw new ApiError(409, "User with username & email already exists")
   }


   const avatarLocalPath = req.files?.avatar[0];
   const coverImageLocalPath = req.files?.coverImage[0];
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   // console.log(req.files);

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }

   if (!coverImageLocalPath) {
      throw new ApiError(400, "CoverImage file is required")
   }

   // let coverImageLocalPath = '';
   // if (req.files && Array.isArray(req.files.coverImage) && res.files.coverImage.length > 0) {
   //    coverImageLocalPath = req.files.coverImage[0].path;
   // }

   const avatar = await uploadOnClodinary(avatarLocalPath)
   const coverImage = await uploadOnClodinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "Avatar file is not uploaded on cloudinary")
   }


   const user = await User.create({
      fullName,
      avatar: {
         public_id: avatar.public_id,
         url: avatar.secure_url,
     },
     coverImage: {
         public_id: coverImage.public_id,
         url: coverImage.secure_url,
     },
      email,
      username: username.toLowerCase(),
      password
   })


   const createdUser = await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
      throw new ApiError(500, 'something went wrong while creating a user')
   }


   return res
          .status(201)
          .json(new ApiResponse(200, createdUser, "user created successfully"))

})


const loginUser = asyncHandler( async ( req, res) => {
    const {username, email, password} = req.body

    if (!username && !email) {
       throw new ApiError(400, "username or email is required")
    }

   // This is a alternate way of writing a code for either username or email verification
   //  if (!(username && email)) {
   //    throw new ApiError(400, "username or email is required")
   // }

    const user = await User.findOne({
       $or: [{username}, {email}]
    })

    if (!user) {
      throw new ApiError(404, "User does not exist")
    }

    const isPasswordValidate = await user.isPasswordCorrect(password)

    if (isPasswordValidate) {
      throw new ApiError(404, "User password does not matched")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
         httpOnly: true,
         secure: true
     }


     return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(
               new ApiResponse(
                  200,
                  {
                     user: loggedInUser, 
                     accessToken, 
                     refreshToken
                  },
                  "User logged In successFully"
               )
            )
})


const logoutUser = asyncHandler( async(req, res) => {
     await User.findByIdAndUpdate(
         req.user._id,
         {
            $unset: {
               refreshToken: 1 //This remove the field from document
            }
         },
         {
            new: true  // send the updated new response
         }
     )

     const options = {
      httpOnly: true,
      secure: true
   }

    return res.status(200)
              .clearCookie("accessToken", options)
              .clearCookie("refreshToken", options)
              .json(
                 new ApiResponse(200, {}, "User Logged used successfully")
              )
})


const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken 

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request")
    }

   try {
       const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
       const user = await User.findById(decodedToken?._id)
   
       if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
       }
   
       if (incomingRefreshToken !== user?.refreshToken) {
           throw new ApiError(401, "Refresh Token is expired or used")
       }
   
       const options = {
         httpOnly: true,
         secure: true
      }
   
      const {accessToken, NewRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   
       return res.status(200)
                 .cookie("accessToken", accessToken, options)
                 .cookie("refreshToken", NewRefreshToken, options)
                 .json(
                    new ApiResponse(200, {accessToken, refreshToken: NewRefreshToken}, "Access Token refreshed")
                  )
   
       }
        catch (error) {
          throw new ApiError(401, error?.message || "inavlid refresh Token")
       }
})


const changeCurrentPassword = asyncHandler( async(req, res) => {
   //const {oldPAssword, newPassword, confPassword} = req.body

   // if (!(newPassword === confPassword)) {
   //   throw new ApiError(400, "Invalid confirmation password")
   // }

     const {oldPAssword, newPassword} = req.body

     const user = await User.findById(req.user?._id)

     const isCorrectedPassword = await user.isPasswordCorrect(oldPAssword)

     if (!isCorrectedPassword) {
        throw new ApiError(400, "Invalid old password")
     }

     user.password = newPassword

     await user.save({validateBeforeSave: false})

     return res
            .status(200)
            .jason(
             new ApiResponse(200, {} , "Password updated successfully")
            )
})


const getCurrentUser = asyncHandler( async(req, res) => {
      return res
             .status(200)
             .json(
               new ApiResponse(200, req.user, "User fetched successfully")
             )
})


const updateAccountDetails = asyncHandler( async( req, res) => {
     const {fullName, email} = req.body

     if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
     }

     const user = await User.findByIdAndUpdate(req.user?._id,
                    {
                       $set: {
                          fullName,
                          email
                       }
                    },
                    {
                       new: true //Show the new updated data
                    }
                ).select("-password -refreshToken")
               
      return res
            .status(200)
            .json( 
                new ApiResponse(200, user, "User updated successfully")
             )
})


const updateUserAvatar = asyncHandler( async(req, res) => {
   //  if(req.file.path !== ""){
   //    const user = await User.findById(req.user?._id)
   //    await destroyCloudImage(user.avatar.)
   //  }
   //   const avatarLocalPath = req.file?.path

   if (req.file.path !== "") {
      const user = await User.findById(req.user._id);
      await destroyCloudImage(user.avatar.public_id)
   }

    const avatarLocalpath = req.file?.path;

     if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar localPath is missing")
     }

     const avatar = await uploadOnClodinary(avatarLocalpath)

     if (!avatar.url) {
       throw new ApiError(400, "Avatar url is missing")
     }

     const user = await User.findByIdAndUpdate(req.user?._id, 
          {
            $set: {
               avatar: {
                  public_id: avatar.public_id,
                  url: avatar.secure_url
               }
            }
          },
          {
             new: true
          }
     ).select("-password")

     return res 
     .status(200)
     .json(
           new ApiResponse(200, user, "avatar updated successfully")
         )
}) 


const updateUsercoverImage = asyncHandler( async(req, res) => {
   // const coverImageLocalPath = req.file?.path

   if (req.file.path !== "") {
      const user = await User.findById(req.user._id);
      await cloudinary.uploader.destroy(user.coverImage.public_id)
  }

  const coverImageLocalPath = req.file?.path

   if (!coverImageLocalPath) {
      throw new ApiError(400, "coverImage localPath is missing")
   }

   const coverImage = await uploadOnClodinary(coverImageLocalPath)

   if (!coverImage.url) {
     throw new ApiError(400, "coverImage url is missing")
   }

   const user = await User.findByIdAndUpdate(req.user?._id, 
        {
            $set: {
               coverImage: {
                 public_id: coverImage.public_id,
                 url: coverImage.secure_url
               }
            }
        },
        {
           new: true
        }
   ).select("-password")

   return res 
         .status(200)
         .json(
               new ApiResponse(200, user, "CoverImage updated successfully")
             )
}) 


const getUserChannelProfile = asyncHandler( async(req, res) => {
      const {username} = req.params

      if (!username) {
         throw new ApiError(400, "Username is not missing")
      }

      const channel = await User.aggregate([
           {
              $match: {
                 username: username?.toLowerCase()
              }
           },
           { //Collect array document of subscribers for a channel
              $lookup: {
                 from: "subscriber",
                 localField: "_id",
                 foreignField: "channel",
                 as: "subscribers"
              }
           },
           { //Collect array document of channel/single who subscribed to other channels
               $lookup: {
                  from: "channel",
                  localField: "_id",
                  foreignField: "subscriber",
                  as: "subscriberdTO"
               }
           },
           { //Addfileds: Provide the options to add or collect the above data, add new fileds to this document
               $addFields: {
                  subscriberCount: {
                      $size: "$subscribers"
                      //Count the number of subscribers present 
                  },
                  channelsSubscribedToCount: {
                      $size: "$subscriberdTO"
                      //Count the number of channels channel has subscribed  
                  },
                  isSubscribed: {
                      $cond: {
                        //Checked the user is there in a document to show subscribed or not subscribed
                         if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                         then: true,
                         else: false
                      }  
                  }
               }
           },
           { //It gives projection that ye sari values ko project nhi karega, mai usko selected chije dunga usko hivo project karega aur vo hm nichge jaisa likha hai vaisa likhte
              $project: {
                 fullName: 1,
                 username: 1,
                 email: 1,
                 subscriberCount: 1,
                 channelsSubscribedToCount: 1,
                 isSubscribed: 1,
                 avatar: 1,
                 coverImage: 1,
              }
           }
      ])

      if (!channel?.length) {
         throw new ApiError(404, "Channel does not exists")
      }

      return res.status(200)
                .json( 
                   new ApiResponse(200,channel[0], "User channel fetched successfully")
                )
               //channel[0]: beacuse we selected only one user's data to show as per given in a $match operator. Actuall match first position pe la leta document ko so channel[0].
})


const getWatchHistory = asyncHandler( async( req,res) => {
    const user = await User.aggregate([
       { 
          $match: {
            _id: new mongoose.Types.Object(req.user?._id)
           //This is used way becz we can't direct get the string ie. _id from the mongoDB so we make use of mongoose which will directly provide _id through its internal operations
         // See in mongoDB: _id: ObjectId('8745gr84gb89jgfiweu')
         }
       },
       {
         $lookup: {
            //selected the the watchHistory documents from the user
             from: "videos",
             localField: "watchHistory",
             foreignField: "_id",
             as: "WatchHistory",
             pipeline: [
               {
               //Inside the video schema, there is owner which is found through a way in which we returned to user schema and get the user data
                  $lookup: {
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner",
                     pipeline: [
                        {
                        //Inside the owner at user schema, Selected the user data to show/verify the user instead of giving so much unneccesary data like email, etc,...
                           $porject: {
                               fullname: 1,
                               username: 1,
                               avatar: 1
                           }
                        }
                     ]
                  }
               }, 
               {
               //Helped for the frontend to easily get the values of user at the first position
                  $addFields: {
                     owner: {
                        $first: "$owner"
                     }
                  }
               }
            ]
         }
       }
    ])
    
    return res.status(200)
              .json(
                new ApiResponse(
                   200, user[0].watchHistory, "Watch history fetched successfully"
                )
              )
})


export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory
  }