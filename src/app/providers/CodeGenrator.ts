import crypto from 'crypto';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { RoomRepository } from '../database/repositories/RoomRepository';
import { Logger } from '../Log';


export interface ICodeGenerator {
    generate(): Promise<string>;
}

@injectable()
export class CryptoCodeGenerator implements ICodeGenerator {
    
    constructor(
        @inject(TYPES.RoomRepository) private _roomRepo: RoomRepository,
        @inject(TYPES.Logger) private _logger: Logger
    ){}

    async generate(): Promise<string> {
        this._logger.debug("New Code Requested. Generating..");
        const code = crypto.randomBytes(4).toString("hex");

        this._logger.debug("Code generated " + code, "Cheking validity...");
        const exists = await this._roomRepo.findOne({ code });
        if ( !exists ) return code;
        else {
            this._logger.debug("Code assigned to", exists);
            this._logger.debug("Code already assigned. Trying again..")
        };
        return this.generate();
    }

}