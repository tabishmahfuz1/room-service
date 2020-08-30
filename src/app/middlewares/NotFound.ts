import Middleware from "./Middleware";
import { Request, Response, NextFunction } from "express";
import { Logger } from "../Log";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { MetricCollectorInterface } from "../providers/MetricsProvider";

@injectable()
export default class NotFoundMiddleware extends Middleware {
    @inject(TYPES.Logger) logger: Logger
    @inject(TYPES.MetricCollector) metricCollector: MetricCollectorInterface

    static readonly NOT_FOUND_ERROR = 'NOT_FOUND_ERROR';

    handle = (req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({
            status: 'error',
            code: NotFoundMiddleware.NOT_FOUND_ERROR,
            message: 'The requested endpoint does not exist'
        });

        this.metricCollector.incrementCounter('error', {
            path: req.path,
            name: NotFoundMiddleware.NOT_FOUND_ERROR
        })

        this.logger.error(NotFoundMiddleware.NOT_FOUND_ERROR, {
                path: req.path, 
                method: req.method, 
                header: req.header
            });
    }
}