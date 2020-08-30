import Routes, { IControllerRoute } from './Routes'
import { container } from '../inversify.config'
import { injectable } from 'inversify'
import { HealthStatusController } from '../controllers/HealthStatusController'
import { ReadyStatusController } from '../controllers/ReadyStatusController'

@injectable()
export default class BasePathRoutes extends Routes {

    /**
	 * IMPORTANT: User the '/' prefix before the path name
	 * to avoid the 404 Error
	 */
    basePath(): string {
        return ''
    }

    /**
	 * IMPORTANT: User the '/' prefix before the path name
	 * to avoid the 404 Error
	 */
    controllers(): IControllerRoute[] {
        return [{
            path: '/health',
            controller: container.get(HealthStatusController),
            method: 'get'
        },{
            path: '/ready',
            controller: container.get(ReadyStatusController),
            method: 'get'
        }]
    }

}