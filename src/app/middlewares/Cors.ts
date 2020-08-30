import Middleware from "./Middleware";
import { Request, Response, NextFunction, Application } from "express";
import cors from 'cors';
import { injectable } from "inversify";

@injectable()
export class Cors extends Middleware {

    /**
     * Overriden method for third party middleware
     * @param app The Express Application
     */
    register(app: Application): Application {
        app.use(cors());
        return app;
    }

    handle(req: Request, res: Response, next: NextFunction) {
        // Nothing to do !
    }

}