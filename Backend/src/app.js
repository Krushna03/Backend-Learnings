import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// 3 Important configurations

// here we have limited the json data from form to prevent server crash or load on server
app.use(express.json({limit: "16kb"}))

// To collect the data from the url like we search on google input box and then the url generated regarding the search
// {extended: true} : object ke ander object (mostly not used)
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//To store images, pdfs, favicon locally on our server we use static & public is the folder available in the files 
app.use(express.static('public'))


//Used to perform the CRUD operation on cookies stored in user's browser ie. to access the cookies of user's browser and peform CRUD operations on cookies
app.use(cookieParser())



//--------------------------------****----------------------------//

// Routes Import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
//we can provide the changed name if the export is default thus instead of router we can use userRouter


//Here we didn't write the get() method instead we use the middleware use() as the files are in different folders. Not as same as the first video
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

export { app }