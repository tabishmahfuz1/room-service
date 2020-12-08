import Middleware from "./Middleware";
import { Application, Request, Response, NextFunction } from "express";
import { ApolloServer } from 'apollo-server-express';
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import Schema from "../graphql/Schema";
import { Logger } from "../Log";
import { GraphQLError } from "graphql";
import { MetricCollectorInterface } from "../providers/MetricsProvider";
import { Error } from "mongoose";
import Config from "../providers/config/Config";

@injectable()
export class GraphQL extends Middleware {

    constructor(
        @inject(TYPES.Schema) private schema: Schema,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.MetricCollector) private metricCollector: MetricCollectorInterface,
    ) {
        super();
    }

    /**
     * The ApolloGraphQl Context builder
     * @param param0 The Object containing the Request Object
     * @returns Context
     */
    context = ({ req }) => {
        // this.logger.debug("Building context", {auth: req.auth, operation: req.body})
        if ( req.auth ) {
            return { auth: {
                userId: req.auth.email || req.auth.phone,
                permissions: req.auth.permissions
            }};
        }
    }

    getTokenFromHeader(req: Request): string {
        if ( req.headers && req.headers.authorization ) {
            return req.headers.authorization.split(' ')[1];
        } else  {
            return null;
        }
    }

    register(app: Application): Application {
        if ( process.env.NODE_ENV === 'development' )
            console.log("Registering GraphQL Middleware")
        new ApolloServer({
            // schema: this.schema.build(),
            typeDefs: this.schema.typeDefs(),
            resolvers: this.schema.prepareResolvers(),
            context: this.context,
            formatError: err => this.logError(err)
        }).applyMiddleware({app});

        return app;
    }


    /**
     * Function to be passed in the formatError of Apollo Server
     * @param err The Error object
     * @returns err Error
     */
    logError(err: GraphQLError): GraphQLError {
        // TODO::Catch mongoose.castError to return INVALID_ENTITY_ID Error

        if ( err.originalError instanceof Error.CastError ) {
            // console.log("CastError");
            err.extensions.code = 'INVALID_ENTITY_ID';
        }

        this.metricCollector.incrementCounter('graphql_error', {
            code: err.extensions.code,
            /**
             * err.path is not present if
             * errors happen before start of resolver execution.
             * i.e. INPUT Errors
             */
            path: err.path? err.path.join('.') : 'INPUT_ERROR'
        });
        this.logger.error("GRAPHQL_ERROR", err);
        return err;
    }

    handle(req: Request, res: Response, next: NextFunction) {
        // Nothing here
    }
}