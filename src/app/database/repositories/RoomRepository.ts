import { IRoomModel, RoomModel } from "../models/Room";
import { IRoom } from "../models/interfaces/Room";
import { injectable } from "inversify";
import { BaseRepository, Optional } from "./BaseRepository";

export interface RoomRepository extends BaseRepository<IRoom, IRoomModel> {}

@injectable()
export class MongooseRoomRepository implements RoomRepository {
    create(Room: Optional<IRoom, 'createdAt'>): Promise<IRoomModel> {
        let newRoom = new RoomModel(Room);
        return newRoom.save();
    }    
    
    findById(id: string): Promise<IRoomModel> {
        return RoomModel.findById(id).exec();
    }
    
    
    findOne(filters?: any): Promise<IRoomModel> {
        return RoomModel.findOne(filters).exec();
    }
    
    
    find(filters?: any, fields?: any, populateRelations?:boolean): Promise<IRoomModel[]> {
        let query = RoomModel.find(filters || {})

        if( fields ) {
            query = query.select(fields);
        }

        // if (populateRelations) {
        //     query = query.populate('company').populate('pmt').populate('division')
        // }
        return query.exec();
    }
    
    
    delete(id: string): Promise<IRoomModel> {
        return RoomModel.findByIdAndDelete(id).exec();
    }
    
    
    async deleteMany(filters: any): Promise<Number> {
        let res = await RoomModel.deleteMany(filters).exec();
        return res.deletedCount;
    }


}