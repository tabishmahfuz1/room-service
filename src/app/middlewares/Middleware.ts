import { NextFunction, Response, Request, Application } from "express";
import { injectable } from "inversify";
import { Registerable } from "../Registerable";

@injectable()
export default abstract class Middleware implements Registerable {
    abstract handle(req: Request, res: Response, next: NextFunction);

    register(app: Application): Application {
        app.use(this.handle);
        // Use the statement below instead if 'this' is undefined
        // _express.use((req, res, next) => this.handle(req, res, next)); 
        return app;
    }
}