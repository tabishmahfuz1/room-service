import Schema from "./Schema";
import typeDefs, { decorateTypeDefs } from './typeDefs';
import Resolver from "./resolvers/Resolver";
import { injectable, inject } from "inversify";
import { getAsArray as GetRoomResolvers } from './resolvers/RoomResolvers';
import { getAsArray as GetPostResolvers } from './resolvers/PostResolvers';
import Config from "../providers/config/Config";
import { TYPES } from "../types";
import { Logger } from "../Log";
import Date from "./resolvers/CustomScalars/Date";

@injectable()
export default class AppSchema extends Schema {
    additionalTypes: Array<string>;

    constructor(
        @inject(TYPES.Config) private _config: Config,
        @inject(TYPES.Logger) private _logger: Logger
    ) {
        super();
        this.additionalTypes = this._config.get('postTypes');
        
        this._logger.info("Additional Types Read", this.additionalTypes);
    }

    customResolvers() {
        return [
            Date
        ];
    }

    typeDefs(): string {
        return decorateTypeDefs(typeDefs, this.additionalTypes);
    }    
    
    resolvers(): Resolver[] { 
        return GetRoomResolvers()
        .concat(GetPostResolvers());
    }

}