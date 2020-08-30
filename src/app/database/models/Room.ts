import { Schema, model, Document } from 'mongoose';
import { IRoom } from './interfaces/Room';


export interface IRoomModel extends IRoom, Document {

}

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    members: [String],
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

export const RoomModel = model<IRoomModel>('Room', RoomSchema);
