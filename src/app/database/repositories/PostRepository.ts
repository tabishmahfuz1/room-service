import { IPostModel, PostModel } from "../models/Post";
import { IPost } from "../models/interfaces/Post";
import { injectable } from "inversify";
import { BaseRepository, Optional } from "./BaseRepository";

export interface PostRepository extends BaseRepository<IPost, IPostModel> {}

@injectable()
export class MongoosePostRepository implements PostRepository {
    create(Post: Optional<IPost, 'createdAt'>): Promise<IPostModel> {
        let newPost = new PostModel(Post);
        return newPost.save();
    }    
    
    findById(id: string): Promise<IPostModel> {
        return PostModel.findById(id).exec();
    }
    
    
    findOne(filters?: any): Promise<IPostModel> {
        return PostModel.findOne(filters).exec();
    }
    
    
    find(filters?: any, fields?: any, populateRelations?:boolean): Promise<IPostModel[]> {
        let query = PostModel.find(filters || {})

        if( fields ) {
            query = query.select(fields);
        }

        // if (populateRelations) {
        //     query = query.populate('company').populate('pmt').populate('division')
        // }
        return query.exec();
    }
    
    
    delete(id: string): Promise<IPostModel> {
        return PostModel.findByIdAndDelete(id).exec();
    }
    
    
    async deleteMany(filters: any): Promise<Number> {
        let res = await PostModel.deleteMany(filters).exec();
        return res.deletedCount;
    }


}