import connectDB from './DB/index.js'
import dotenv from 'dotenv'
import { app } from './app.js'

dotenv.config({
   //  path: './.env'
    path: './env'
})

connectDB()
.then(() => {
   app.on("Error: ", (error) => {
      console.log("DB connection not established: ", error);
    })

    app.listen(process.env.PORT || 8000 , () =>{
      console.log(`Server is running at Port: ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log(err, "Mongo DB connection failed");
})

















 // This is commented beacuse we are using more professional approach in which we are connecting database in another file and then importing that file to this file

/*
import express from 'express'
const app = express()
( async () => {
   try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

      app.on("Error: ", (error) => {
        console.log("Express is not able to connect the DB: ", error);
      })

      app.listen(process.env.PORT, () => {
        console.log(`App is listening on ${process.env.PORT}`);
      })

   } catch (error) {
      console.log("Error: ", error );
      throw error;
   }
})()
*/