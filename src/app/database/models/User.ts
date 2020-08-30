import { Schema, model, Document } from 'mongoose';
import { IUser } from './interfaces/User';


export interface IUserModel extends IUser, Document {

}

const UserSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }]
});

export const UserModel = model<IUserModel>('User', UserSchema);
