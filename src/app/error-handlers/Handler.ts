import { Request, Response, NextFunction, Application } from "express";
import { injectable } from "inversify";
import { Registerable } from "../Registerable";

@injectable()
export abstract class Handler implements Registerable {
    
    /**
     * Handle error in this function
     * @param err The error object
     * @param req The request object
     * @param res The response stream object
     * @param next The Next function
     */
    abstract handle(err: Error, req: Request, res: Response, next: NextFunction): any;

    register(app: Application): Application {
        app.use(this.handle);
        return app;
    }
}