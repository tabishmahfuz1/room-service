import { IUserModel, UserModel } from "../models/User";
import { IUser } from "../models/interfaces/User";
import { injectable } from "inversify";
import { BaseRepository, Optional } from "./BaseRepository";

export interface UserRespository extends BaseRepository<IUser, IUserModel> {}

@injectable()
export class MongooseUserRepository implements UserRespository {
    create(User: Optional<IUser, 'rooms'>): Promise<IUserModel> {
        let newUser = new UserModel(User);
        return newUser.save();
    }    
    
    findById(id: string): Promise<IUserModel> {
        return UserModel.findById(id).exec();
    }
    
    
    findOne(filters?: any): Promise<IUserModel> {
        return UserModel.findOne(filters).exec();
    }
    
    
    find(filters?: any, fields?: any, populateRelations?:boolean): Promise<IUserModel[]> {
        let query = UserModel.find(filters || {})

        if( fields ) {
            query = query.select(fields);
        }

        // if (populateRelations) {
        //     query = query.populate('company').populate('pmt').populate('division')
        // }
        return query.exec();
    }
    
    
    delete(id: string): Promise<IUserModel> {
        return UserModel.findByIdAndDelete(id).exec();
    }
    
    
    async deleteMany(filters: any): Promise<Number> {
        let res = await UserModel.deleteMany(filters).exec();
        return res.deletedCount;
    }


}