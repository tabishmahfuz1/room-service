import { Request } from "express";
import { createWriteStream } from "fs";
import { inject, injectable } from "inversify";
import { PostRepository } from "../database/repositories/PostRepository";
import { IFileRepository } from "../providers/FileRepository";
import { TYPES } from "../types";
import Controller from "./Controller";

@injectable()
export class GetFileController extends Controller {
    constructor(
        @inject(TYPES.FileRepository)
        private _fileRepo: IFileRepository,

        @inject(TYPES.PostRepository)
        private _postRepo: PostRepository
    ) {
        super();
    }

    async handle(req: Request): Promise<any> {
        const { params: { fileId } } = req;

        (await this._fileRepo.getById(fileId)).pipe(this.res);
        // (await this._fileRepo.getById(fileId)).pipe(createWriteStream('abc.png')); // For debugging

        this.responseSent = true;
    }
    
}