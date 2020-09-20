import { Request, Response } from 'express';
import { Logger } from '../Log';
import { TYPES } from '../types';
import { injectable, inject } from 'inversify';
import { MetricCollectorInterface } from '../providers/MetricsProvider';
import { performance } from 'perf_hooks';

interface ExtendedRequest extends Request {
    auth?: any
}

@injectable()
export default abstract class Controller {
    req: ExtendedRequest;
    res: Response;
    responseSent = false;
    logRequest = true;

    // TODO::Change to True once ready
    requiresAuthentication = false;

    @inject(TYPES.Logger) logger: Logger;
    @inject(TYPES.MetricCollector) metricCollector: MetricCollectorInterface;
    
    /**
     * The Request Controller function responsible for processing all incoming requests
     * @param req Express.Request The Request Received
     * @param res Express.Response The Response Express Object
     */
    async process(req: Request, res: Response): Promise<any> {
        this.req = req
        this.res = res

        try {
            this.logRequest && this.logger.info("Request Received", req.path);

            let t0 = performance.now();
            if ( this.requiresAuthentication ) {
                this.enforceAuth();
            }
            let response = await this.handle(req);
            let duration = performance.now() - t0;
            if (!this.responseSent) {
                res.json({
                    status: 'success',
                    response
                });
                this.logRequest && this.logger.debug("Response Sent", response);
            }
            this.metricCollector.histogram("request_duration", duration, {
                path:`${req.path}`
            });
        } catch(err) {
            if ( err instanceof ApiError ) {
                this.logger.error("CONTROLLER_ERROR", err);
                this.metricCollector.incrementCounter("errors", {
                    path: this.req.path,
                    name: err.name
                });
                res.json({
                    status: "error",
                    code: err.code,
                    message: err.message
                });
            } else {
                throw err
            }
        }
    }


    /**
     * Checks and throws Authentication Error if neccessary
     */
    enforceAuth(): boolean {
        if ( ! this.req.auth )
            throw new ApiError(ApiError.UNAUTHENTICATED_ERROR_CODE, 'Unaithenticated');

        return true;
    }

    /**
     * Controller specific Function to handle requests
     * Needs to be implemented  
     * @param req The Request Object
     */
    abstract handle(req): Promise<any>
}

export class ApiError extends Error {
    static readonly UNAUTHENTICATED_ERROR_CODE = 'UNAUTHENTICATED';
    static readonly UNAUTHORIZED_ERROR_CODE = 'UNAUTHORIZED';
    constructor(public code: string, public message: string) {
        super(message)
    }
}