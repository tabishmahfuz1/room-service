import Resolver from "./Resolver";
import { ResolverType } from "./RESOLVER_TYPES";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PostRepository } from "../../database/repositories/PostRepository";
import { IFileRepository } from "../../providers/FileRepository";
import { Readable } from "stream";
import { ApolloError, UserInputError } from "apollo-server-express";
import { container } from "../../inversify.config";
import { createWriteStream } from "fs";
import { RoomRepository } from "../../database/repositories/RoomRepository";
import { IDocumentParser } from "../../providers/DocumentParser";

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
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository,
        @inject(TYPES.FileRepository) private _fileRepo: IFileRepository,
        @inject(TYPES.DocumentParser) private _documentParser: IDocumentParser
    ){
        super();
    }

    async handle(parent: any, { post }: { post: PostInput }, context: any) {
        this.logger.debug("PARAMS", {post, auth: this.auth()});
        const room = await this._roomRepo.findById(post.room);
        if ( !room )
            throw new UserInputError("Invalid Room ID");
            
        if ( post.parentPost ) {
            const parentPost = await this._postRepo.findById(post.parentPost);
            if ( !parentPost ) 
                throw new UserInputError("Invalid Parent Post ID");
        }

        if ( room.blacklistedLabels.length ) {
            this.logger.debug("Blacklisted Labels are", room.blacklistedLabels);
        }

        const promises = post.attachments.map(async(attachment) => {
            const { filename, mimetype, createReadStream } = await attachment;
            const labels = await this._documentParser.labels(filename, createReadStream());

            this.logger.debug(`Labels for ${filename}`, labels);

            if ( labels.some(l => room.blacklistedLabels.includes(l.toLocaleLowerCase())) ) {
                // throw new UserInputError("Blacklisted Labels Found in Document");
                throw new ApolloError(`Blacklisted Labels Found in File ${filename}`, "BLACKLISTED_LABEL_FOUND");
            }

            post.labels = post.labels.concat(labels);
        });

        await Promise.all(promises);

        post.labels = post.labels?.map(l => l.toLowerCase());
        this.logger.debug("Labels for Post", post.labels);
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
                fileId: ref.response._id,
                name: filename,
                type: mimetype
            };
        });

        const postToCreate = {
            ...post,
            createdBy: this.auth().userId,
            attachments: await Promise.all(files)
        };

        this.logger.debug("To create", postToCreate)

        return this._postRepo.create(postToCreate);
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

    handle(_, { inp }: { inp: any }) {
        if ( inp.labels )
            inp.labels = inp.labels?.map(l => l.toLowerCase());
        return this._postRepo.find(inp);
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