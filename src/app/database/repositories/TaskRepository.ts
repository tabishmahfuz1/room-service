import { ITaskModel, TaskModel } from "../models/Task";
import { ITask } from "../models/interfaces/Task";
import { injectable } from "inversify";
import { BaseRepository, Optional } from "./BaseRepository";

export interface TaskRepository extends BaseRepository<ITask, ITaskModel> {}

@injectable()
export class MongooseTaskRepository implements TaskRepository {
    create(Task: Optional<ITask, 'createdAt'>): Promise<ITaskModel> {
        let newTask = new TaskModel(Task);
        return newTask.save();
    }    
    
    findById(id: string): Promise<ITaskModel> {
        return TaskModel.findById(id).exec();
    }
    
    
    findOne(filters?: any): Promise<ITaskModel> {
        return TaskModel.findOne(filters).exec();
    }
    
    
    find(filters?: any, fields?: any, populateRelations?:boolean): Promise<ITaskModel[]> {
        let query = TaskModel.find(filters || {})

        if( fields ) {
            query = query.select(fields);
        }

        // if (populateRelations) {
        //     query = query.populate('company').populate('pmt').populate('division')
        // }
        return query.exec();
    }
    
    
    delete(id: string): Promise<ITaskModel> {
        return TaskModel.findByIdAndDelete(id).exec();
    }
    
    
    async deleteMany(filters: any): Promise<Number> {
        let res = await TaskModel.deleteMany(filters).exec();
        return res.deletedCount;
    }


}