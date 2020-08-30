import { injectable, inject } from 'inversify';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { TYPES } from '../../types';
import { Logger } from '../../Log';
import { MetricCollectorInterface } from '../../providers/MetricsProvider';
import { performance } from 'perf_hooks';
import { ResolverType } from './RESOLVER_TYPES';
import { Context } from '../Context';

export enum Permissions {
    Admin = "admin",
    Default = "default",
    DeleteJob = 'job:delete',
    AssignJobUser = 'job:assignUser',
}

@injectable()
export default abstract class Resolver {  
    /**
     * @var boolean Indicates if the Resolver should be Authenticated
     */
    isAuthenticatedResolver: boolean = false;
    
    context: Context;

    @inject(TYPES.Logger) logger: Logger;
    @inject(TYPES.MetricCollector) metricRecorder: MetricCollectorInterface;

    /**
     * User Roles to be allowed for the resolver
     * Leave blank to allow all roles
     */
    requiredPermissions(): string[] {
        return [];
    }

    /**
     * Type of the Resolver
     */
    abstract type(): ResolverType;

    /**
     * Name of the Resolver
     */
    abstract key(): string;

    /**
     * The Actual Resoler method that should be implemented
     * to resolve the request
     * @param parent Parent Arg for Resolver
     * @param params The parameters passed to the Resolver
     * @param context The Context Object
     */
    abstract handle(parent, params, context): any;
    
    private resolve = async (parent: any, params: any, context: Context) => {
        this.context = context;
        if ( this.isAuthenticatedResolver )
            this.checkAuth(context);

        try {
            // Capture Start Time
            let t0 = performance.now();

            this.logger.debug("REQUEST_RECEIVED", {operation: this.key(), params});

            // Start the Resolver Process
            let res = await this.handle(parent, params, context);

            // Calculate time spent to resolve
            let duration = performance.now() - t0;

            // Register time in Metric Collector
            this.metricRecorder.histogram("request_duration", duration, {
                path:`Resolver.${this.type()}.${this.key()}`
            });
            return res;
        } catch( err ) {
            this.metricRecorder.incrementCounter('errors', {
                path:`${this.type()}.${this.key()}`,
                name: err.name
            });
            
            this.logger.error(`Error in ${this.type()}.${this.key()}`, {
                message: err.message, 
                stack: err.stack, 
                code: err.name
            });
            throw err;
        }
    }

    /**
     * Checks if the context has a specific permission
     * If a User is Admin, they are always allowed
     * @param permission Permission to Check in User Context
     * @returns boolean
     */
    protected hasPermission(permission: string): boolean {
        return this.context.auth.permissions
                .some(userPermission => userPermission == permission || userPermission == Permissions.Admin)
    }

    /**
     * Auth Check Middleware
     * @param context Context The GraphQL Context
     * @throws AuthenticationError
     */
    private checkAuth(context: Context): boolean {
        if(context && !context.auth ) {
            let operation = `${this.type()}.${this.key()}`;
            this.logger.error("Unauthenticated User", {path: operation});
            this.metricRecorder.incrementCounter('authentication_error', {path: operation});
            throw new AuthenticationError("Unauthenticated");
        } else if ( 
            !this.hasPermission(Permissions.Admin) 
            && this.requiredPermissions().length > 0 
            && this.requiredPermissions()
                    .some( permission => context.auth.permissions.indexOf( permission ) === -1  ) ) {
            
            let operation = `${this.type()}.${this.key()}`;
            this.logger.error("UNAUTOHRIZED User", {path: operation});
            this.metricRecorder.incrementCounter('authorization_error', {path: operation});
            throw new ForbiddenError("Unauthorized");
        }
        return true;
    }

    auth() {
        return process.env.NODE_ENV == 'development'? { userId: "dev" } : this.context.auth;
    }

    /**
     * Returns GraphQL Resolver Object
     */
    get() {
        return {
            [this.type()]: {
                [this.key()]: this.resolve
            }
        }
    }
}