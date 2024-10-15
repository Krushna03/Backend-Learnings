import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
   try {
     const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

     console.log(`\n MongoDb connected !!! ${connection.host}`);
     
   } catch (error) {
      console.log("MongoDB connection failed", error);
      process.exit(1) //Node method for existing a process synchronously with an exit status of code
   }
}

export default connectDB;