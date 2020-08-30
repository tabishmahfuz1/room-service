import { Handler } from "./Handler";
import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { Logger } from "../Log";
import { MetricCollectorInterface } from "../providers/MetricsProvider";

@injectable()
export default class ErrorHandler extends Handler {
    static readonly INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR' 

    constructor(
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.MetricCollector) private metricCollector: MetricCollectorInterface
    ) {
        super()
    }

    handle = (err: Error, req: Request, res: Response, next: NextFunction) => {
        // if ( err instanceof  SomeError )
        //      Do Something Special !

        res.json({
            status: 'error',
            code: ErrorHandler.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occured'
        });

        this.metricCollector.incrementCounter('errors', {
            path: req.path,
            name: err.name
        });

        this.logger.error("INTERNAL_ERROR", err.stack);
    }
    
}