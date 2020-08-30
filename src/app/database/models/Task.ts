import { Schema, model, Document } from 'mongoose';
import { ITask } from './interfaces/Task';


export interface ITaskModel extends ITask, Document {

}

const TaskSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    customAttrs: {
        type: String,
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    createdAt: {
        type: Date, 
        required: true,
        default: () => new Date()
    }
});

export const TaskModel = model<ITaskModel>('Task', TaskSchema);
