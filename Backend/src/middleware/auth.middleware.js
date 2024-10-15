import  jwt  from 'jsonwebtoken'
import { ApiError } from '../utils/apiError.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../model/User.model.js'



// export const verifyJWT = asyncHandler( async (req, res, next) => {
// Here the res is of no use, it is not used anywhere, so in prodctuion code we write res or any other like below

export const verifyJWT = asyncHandler( async (req, _, next) => {
 try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }
 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
    if (!user) {
       throw new ApiError(401, "Invalid access Token at verifyJWT")
    }
 
    // Here: req.user is just a name it can anything like req.krushna. Here we are storing the user details.
     req.user = user
     // req ke pass user hai uss user me maine apna user add kr diya bole toh matched the user who is logged in and the same user jisko log out karna hai.
     // Basically login ogout vala function ke liye iska use kiya
 
     next()

   } 
    catch (error) {
     throw new ApiError(401, error?.message || "Invalid access token")
  }
})