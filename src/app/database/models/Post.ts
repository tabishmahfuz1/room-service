import { Schema, model, Document } from 'mongoose';
import { IPost } from './interfaces/Post';


export interface IPostModel extends IPost, Document {

}

const PostSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    attachments: [{
        fileId: {type: String, required: true},
        name: {type: String, required: true},
        type: {type: String}
    }],
    text:{
        type: String,
    },
    labels: [String],
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    parentPost: {
        type: Schema.Types.ObjectId, 
        ref: 'Post'
    },
    createdBy: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date, 
        required: true,
        default: () => new Date()
    }
});

export const PostModel = model<IPostModel>('Post', PostSchema);
