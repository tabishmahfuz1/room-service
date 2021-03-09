import Resolver, { Permissions } from "./Resolver";
import { ResolverType } from "./RESOLVER_TYPES";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { ApolloError, UserInputError } from "apollo-server-express";
import { container } from "../../inversify.config";
import { RoomRepository } from "../../database/repositories/RoomRepository";
import { ICodeGenerator } from "../../providers/CodeGenrator";
import { ApiError } from "../../controllers/Controller";
import { UserRespository } from "../../database/repositories/UserRepository";
import { PostRepository } from "../../database/repositories/PostRepository";
import { IRoomModel } from "../../database/models/Room";
import { IUserModel } from "../../database/models/User";
import { TaskRepository } from "../../database/repositories/TaskRepository";

interface CreateRoomInput {
    name: string;
    blacklistedLabels?: string[];
    members?: string[];
}

interface UpdateRoomInput {
    id: string;
    name: string;
}

@injectable()
export class CreateRoomResolver extends Resolver {
    type(): ResolverType {
        return "Mutation";
    }    
    
    key(): string {
        return "createRoom";
    }

    constructor(
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository,
        @inject(TYPES.CodeGenerator) private _codeGenerator: ICodeGenerator
    ) {
        super();
    }
    
    async handle(parent: any, { inp }: { inp: CreateRoomInput }, context: any): Promise<any> {
        const code = await this._codeGenerator.generate();

        this.logger.debug("Created Code", code);

        const createdBy = this.auth().userId;

        this.logger.debug("Auth ID", createdBy);

        const members = [createdBy, ...(inp.members || [])];

        const input = {
            ...inp, 
            blacklistedLabels: inp.blacklistedLabels? inp.blacklistedLabels.map(b => b.toLowerCase()) : [], 
            code, 
            members, 
            createdBy, 
            createdAt: new Date()
        };
        this.logger.debug("Creating Room", input)
        return this._roomRepo.create(input);
    }
}


@injectable()
export class UpdateRoomResolver extends Resolver {
    type(): ResolverType {
        return "Mutation";
    }    
    
    key(): string {
        return "updateRoom";
    }

    constructor(
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository,
    ) {
        super();
    }
    
    async handle(parent: any, { inp }: { inp: UpdateRoomInput }, context: any): Promise<any> {
        const room = await this._roomRepo.findById(inp.id);
        if(!room) throw new ApiError("INVALID_ID", "The provided Room ID is invalid");
        if(!inp.name) throw new ApiError("INVALID_NAME", "Invalid Room Name. Name cannot be blank");

        room.name = inp.name;

        return room.save();
    }
}

@injectable()
export class JoinRoomResolver extends Resolver {
    
    type(): ResolverType {
        return "Mutation";
    }
    
    key(): string {
        return "joinRoom";
    }

    constructor(
        @inject(TYPES.UserRepository)
        private _userRepo: UserRespository,
        @inject(TYPES.RoomRepository)
        private _roomRepo: RoomRepository
    ){
        super();
    }
    
    async handle(parent: any, { roomCode }: { roomCode: string }, context: any) {

        const { userId } = this.auth();
        this.logger.debug("User ID", userId);
        const room = await this._roomRepo.findOne({ code: roomCode });

        if ( !room ) {
            throw new UserInputError("Invalid Room Code");
        }

        // const user = (await this._userRepo.findOne({ userId })) || (await this._userRepo.create({ userId }));

        // if ( !user ) {
            // throw new UserInputError("Invalid User ID");   
        // }

        return addUserToRoom(room, userId);
    }
}

@injectable()
export class AddMemberResolver extends Resolver {
    
    type(): ResolverType {
        return "Mutation";
    }
    
    key(): string {
        return "addMember";
    }

    constructor(
        @inject(TYPES.UserRepository)
        private _userRepo: UserRespository,
        @inject(TYPES.RoomRepository)
        private _roomRepo: RoomRepository
    ){
        super();
    }
    
    async handle(_: any, { roomId, userId }: { roomId: string, userId: string }) {
        const room = await this._roomRepo.findById(roomId);

        if ( !room ) {
            throw new UserInputError("Invalid Room ID");
        }

        // const user = await this._userRepo.findOne({ userId });

        // if ( !user ) {
        //     throw new UserInputError("Invalid User ID");
        // }

        return addUserToRoom(room, userId);
    }
}

const addUserToRoom = async (room: IRoomModel, userId: string) => {
    // Add Room to User
    // user.rooms.push(room.id);        
    // Add User to Room
    room.members.push(userId);
    // await user.save();
    return room.save();
} 

@injectable()
export class RemoveRoomMemberResolver extends Resolver {
    type(): ResolverType {
        return "Mutation";
    }    
    
    key(): string {
        return "removeMember";
    }

    constructor(
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository,
        @inject(TYPES.UserRepository) private _userRepo: UserRespository
    ) {
        super();
    }
    
    async handle(parent: any, {roomId, member}: any, context: any): Promise<any> {
        const room = await this._roomRepo.findById(roomId);
        if ( !room ) throw new UserInputError("Invalid Room ID");

        const user = await this._userRepo.findOne({ userId: member });
        if( !user ) throw new UserInputError("Invalid Member ID");

        if ( room.createdBy !== this.auth().userId ) {
            throw new UserInputError("Only the Room Creater may remove a User");
        }

        const memberIndexInRoom = room.members.indexOf(member);
        memberIndexInRoom > -1 && room.members.splice(memberIndexInRoom);

        const roomIndexInUser = user.rooms.indexOf(roomId);
        roomIndexInUser > -1 && user.rooms.splice(roomIndexInUser);

        await user.save();
        return room.save();
    }
}

@injectable()
export class RoomsQuery extends Resolver {
    type(): ResolverType {
        return "Query";
    }
    key(): string {
        return "rooms";
    }

    constructor(
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository
    ){
        super();
    }

    handle(parent: any, { inp }: any, context: any) {
        const { userId } = this.auth();
        return this._roomRepo.find({...inp, members: userId });
    }

}

@injectable()
export class RoomPostsResolver extends Resolver {
    type(): ResolverType {
        return "Room";
    }
    key(): string {
        return "posts";
    }

    constructor(
        @inject(TYPES.PostRepository) private _postRepo: PostRepository
    ){
        super();
    }

    handle({ id }: { id: string }, { inp }: any, context: any) {
        return this._postRepo.find({ room: id })
                .then( res => res || [] );
    }

}

@injectable()
export class RoomTasksResolver extends Resolver {
    type(): ResolverType {
        return "Room";
    }
    key(): string {
        return "tasks";
    }

    constructor(
        @inject(TYPES.TaskRepository) private _taskRepo: TaskRepository
    ){
        super();
    }

    handle({ id }: { id: string }, { inp }: any, context: any) {
        return this._taskRepo.find({ room: id });
    }
}

type TaskInput = {
    name: string;
    customAttrs?: string;
}

@injectable()
export class SaveTasksResolver extends Resolver {
    type(): ResolverType {
        return "Mutation";
    }
    key(): string {
        return "saveTasks";
    }

    constructor(
        @inject(TYPES.TaskRepository) private _taskRepo: TaskRepository,
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository
    ){
        super();
    }

    async handle({ roomId, tasks }: { roomId: string, tasks: Array<TaskInput> }, { inp }: any, context: any) {
        const room = await this._roomRepo.findById(roomId);
        if ( !room ) {
            throw new UserInputError("Invalid roomId");
        }

        return tasks.map(async taskInput => 
            this._taskRepo.create({ ...taskInput, room: roomId }));
    }
}

export const getAsArray: () => Resolver[] = () => {
    return [
        container.get(CreateRoomResolver),
        container.get(UpdateRoomResolver),
        container.get(RemoveRoomMemberResolver),
        container.get(RoomsQuery),
        container.get(RoomPostsResolver),
        container.get(AddMemberResolver),
        container.get(JoinRoomResolver),
        container.get(RoomTasksResolver),
        container.get(SaveTasksResolver),
    ];
}