import { Router, Application, NextFunction, Request, Response } from 'express';
import ControllerInterface from '../controllers/Controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { Logger } from '../Log';
import { MetricCollectorInterface } from '../providers/MetricsProvider';
import { Registerable } from '../Registerable';

export interface IControllerRoute {
	path: string;
	method: 'get' | 'post' | 'put' | 'all';
	controller: ControllerInterface;
	middlewares?: RouteMiddleware[]
}

export type RouteMiddleware =  (req: Request, res: Response, next: NextFunction) => any;

@injectable()
export default abstract class Routes implements Registerable {

	constructor(
		// @inject(TYPES.Logger) private logger: Logger,
		// @inject(TYPES.MetricCollector) private metricCollector: MetricCollectorInterface
	) {
		this.loadRouter()
	}

	router: Router;

	/**
	 * IMPORTANT: User the '/' prefix before the path name
	 * to avaoid the 404 Error
	 */
	abstract controllers(): Array<IControllerRoute>

	/**
	 * IMPORTANT: User the '/' prefix before the path name
	 * to avoid the 404 Error
	 */
	abstract basePath(): string

	protected addRouteToRouter(
		controller: ControllerInterface, 
		path: string, 
		method?: string, 
		middlewares?: RouteMiddleware[]): any {

        this.router[method ?? 'all'](`${path}`, middlewares ?? [], (req, res) => {
			controller.process(req, res);
		})
	}
	
	private loadRouter() {
		this.router = Router()
		this.controllers().forEach((controllerRoute) => {
			this.addRouteToRouter(controllerRoute.controller, 
				controllerRoute.path, controllerRoute.method, controllerRoute.middlewares);
		});
	}

	register(app: Application): Application {
		app.use(`${this.basePath()}`, this.router)
        return app;
	}

	public getRouter(): Router {
		return this.router;
	}

	public availableRoutes(_router: Router) {
		return _router.stack
		  .filter(r => r.route)
		  .map(r => {
			return {
			  method: Object.keys(r.route.methods)[0].toUpperCase(),
			  path: r.route.path
			};
		  });
	}
}