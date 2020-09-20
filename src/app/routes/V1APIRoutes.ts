import Routes, { IControllerRoute } from './Routes'
import { container } from '../inversify.config'
import { injectable } from 'inversify'
import { GetFileController } from '../controllers/GetFileController'

@injectable()
export default class V1APIRoutesRoutes extends Routes {

    /**
	 * IMPORTANT: User the '/' prefix before the path name
	 * to avoid the 404 Error
	 */
    basePath(): string {
        return '/api/v1'
    }

    /**
	 * IMPORTANT: User the '/' prefix before the path name
	 * to avoid the 404 Error
	 */
    controllers(): IControllerRoute[] {
        return [{
            path: '/file/:fileId',
            controller: container.get(GetFileController),
            method: 'get'
        }]
    }

}