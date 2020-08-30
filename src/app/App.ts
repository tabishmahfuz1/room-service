import express from 'express';
import "reflect-metadata";
import Config from './providers/config/Config';
import { Database } from './database/Database';
import Routes from './routes/Routes';
import { Handler } from './error-handlers/Handler';
import ErrorHandler from './error-handlers/ErrorHandler';
import NotFound from './middlewares/NotFound';
import Middleware from './middlewares/Middleware';
import BodyParser from './middlewares/BodyParser';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { container } from './inversify.config';
import { GraphQL } from './middlewares/GraphQL';
import Authenticate from './middlewares/Authenticate';
import { MetricCollectorInterface } from './providers/MetricsProvider';
import { Registerable } from './Registerable';
import { Cors } from './middlewares/Cors';
import BasePathRoutes from './routes/BasePathRoutes';

@injectable()
export class App {
	/**
	 * Create the express object
	 */
	public express: express.Application;

	/**
	 * Add Middlewares here
	 * @property Middleware[]
	 */
	private middlewares: Middleware[] = [
		container.get<Middleware>(BodyParser),
		container.get<Middleware>(Authenticate),
		container.get<Middleware>(Cors),
		container.get<Middleware>(GraphQL)
	]


	/**
	 * Register Routes Here
	 * @property Routes[]
	 */
	private routes: Routes[] = [
		container.get<Routes>(BasePathRoutes)
	];

	/**
	 * Register Error Handlers here 
	 * The order of the handlers matters here
	 * @property Handler[]
	 */
	private errorHandlers: Handler[] = [
		// new ErrorHandler()
		container.get<Handler>(ErrorHandler)
	]

	private providers: Registerable[] = [
		container.get<MetricCollectorInterface>(TYPES.MetricCollector)
	];

	/**
	 * Initializes the express server
	 */
	constructor (
		@inject(TYPES.Config) private config: Config,
		@inject(TYPES.Database) private database: Database
	) {
		this.express = express();
		this.mountConfig();
		this.mountMiddlewares();
		this.mountRoutes();
		this.mountErrorHandlers();
		this.register(this.providers);

		// If no route is matched, route the request
		// through a NotFound Middleware
		// this.express = (new NotFound()).mount(this.express);
		this.express = (container.get(NotFound)).register(this.express);
		this.database.init();
	}

	/**
	 * Mount the configs to the request object 
	 */
	private mountConfig (): void {
		this.express = this.config.init(this.express);
	}

	/**
	 * Mounts all the defined middlewares
	 */
	private mountMiddlewares (): void {
		// console.log("Mounting Middlewares")
		this.register(this.middlewares);
	}

	/**
	 * Mounts all the defined routes
	 */
	private mountRoutes (): void {
		this.register(this.routes);
	}

	/**
	 * Registering Exception / Error Handlers
	 */
	private mountErrorHandlers() {
		this.register(this.errorHandlers);
	}

	/**
	 * Register an array of Registerables to the Application
	 * @param mountables Registerable[] 
	 */
	private register(registerables: Registerable[]) {
		registerables.forEach((registerable) => {
			this.express = registerable.register(this.express);
		})
	}

	/**
	 * Get all defined routes in the application
	 */
	public availableRoutes() {
		return this.express._router.stack
		  .filter(r => r.route)
		  .map(r => {
			return {
			  method: Object.keys(r.route.methods)[0].toUpperCase(),
			  path: r.route.path
			};
		  });
	}


	/**
	 * Starts the express server
	 */
	public init (): any {
		const port: number = Number(this.config.get('port'));

		// Start the server on the specified port
		this.express.listen(port, (_error: any) => {
			// console.log("Routes", this.availableRoutes())
			if (_error) {
				return console.log('Error: ', _error);
			}

			return console.log(`Server Running at 'http://localhost:${port}'`);
		});
	}
}


/** Export the module */
// export default new App(container.get(TYPES.Config));