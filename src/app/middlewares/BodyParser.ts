import Middleware from "./Middleware";
import { Request, Response, NextFunction, Application } from "express";
import * as bodyParser from 'body-parser';
import { injectable } from "inversify";

@injectable()
export default class BodyParser extends Middleware {

    register(_express: Application): Application {
        if ( process.env.NODE_ENV === 'development' )
            console.log("Registering BodyParser Middleware")
        _express.use(bodyParser.json());
        return _express;
    }

    handle(req: Request, res: Response, next: NextFunction) {
        // Nothing to do here !
    }

}