import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new mongoose.Schema({
        videoFile: {
            public_id: {
                type: String,
                required: true,
              },
              url: {
                type: String,
                required: true,
              }
        },
        thumbnail: {
            public_id: {
                type: String,
                required: true,
              },
              url: {
                type: String,
                required: true,
              }
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

        } , {timestamps: true})


        videoSchema.plugin(mongooseAggregatePaginate)
        //This syntax allows us to write the aggregation query as normal queries can be written without it but it's a special package which allows to write the aggregate queries
        //here, plugin is a hook

export const Video = mongoose.model("Video" , videoSchema)