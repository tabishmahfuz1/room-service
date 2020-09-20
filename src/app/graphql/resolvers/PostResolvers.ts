import Resolver from "./Resolver";
import { ResolverType } from "./RESOLVER_TYPES";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PostRepository } from "../../database/repositories/PostRepository";
import { IFileRepository } from "../../providers/FileRepository";
import { Readable } from "stream";
import { UserInputError } from "apollo-server-express";
import { container } from "../../inversify.config";
import { createWriteStream } from "fs";
import { RoomRepository } from "../../database/repositories/RoomRepository";

interface PostInput {
    type: string;
    attachments: Promise<Upload>[];
    text: string;
    room: string;
    labels: string[];
    parentPost?: string;
}

interface Upload { 
    filename: string, 
    mimetype: string, 
    createReadStream: () => Readable 
};

@injectable()
export class CreatePostReolver extends Resolver {
    type(): ResolverType {
        return "Mutation";
    }

    key(): string {
        return "createPost";
    }

    constructor(
        @inject(TYPES.PostRepository) private _postRepo: PostRepository,
        @inject(TYPES.FileRepository) private _fileRepo: IFileRepository
    ){
        super();
    }

    async handle(parent: any, { post }: { post: PostInput }, context: any) {
        this.logger.debug("PARAMS", post);
        if ( post.parentPost ) {
            const parentPost = await this._postRepo.findById(post.parentPost);
            if ( !parentPost ) 
                throw new UserInputError("Invalid Parent Post ID");
        }

        const files = post.attachments.map(async(attachment) => {
            const { filename, mimetype, createReadStream } = await attachment;
            this.logger.debug("File Read", filename);
            const { labels } = post;
            // createReadStream().pipe(createWriteStream(filename));
            const ref = await this._fileRepo.store({
                name: filename,
                mimetype,
                createReadStream,
                labels
            });

            return {
                ref: JSON.parse(ref)._id,
                name: filename,
                type: mimetype
            };
        });

        return this._postRepo.create({
            ...post,
            createdBy: this.auth().userId,
            attachments: await Promise.all(files)
        });
    }
}

@injectable()
export class PostsQueryResolver extends Resolver {
    type(): ResolverType {
        return "Query";
    }
    key(): string {
        return "posts";
    }

    constructor(
        @inject(TYPES.PostRepository) private _postRepo: PostRepository
    ){
        super();
    }

    handle({ postFilterInput }: { postFilterInput: any }) {
        return this._postRepo.find(postFilterInput);
    }
}

@injectable()
export class PostRoomResolver extends Resolver {
    type(): ResolverType {
        return "Post";
    }
    key(): string {
        return "room";
    }

    constructor(
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository
    ){
        super();
    }

    handle({ room }: { room: string }) {
        return this._roomRepo.findById(room);
    }
}

@injectable()
export class PostChildrenResolver extends Resolver {
    type(): ResolverType {
        return "Post";
    }
    key(): string {
        return "childPosts";
    }

    constructor(
        @inject(TYPES.PostRepository) private _postRepo: PostRepository
    ){
        super();
    }

    handle({ id }: { id: string }) {
        return this._postRepo.find({ parentPost: id });
    }
}



export const getAsArray = () => [
    container.get(CreatePostReolver),
    container.get(PostsQueryResolver),
    container.get(PostRoomResolver),
    container.get(PostChildrenResolver),
]