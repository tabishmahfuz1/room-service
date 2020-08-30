import { Application } from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import Config, { IConfigObject } from './Config';

import { injectable, inject } from "inversify";
// import "reflect-metadata";

@injectable()
export default class DotEnvConfig extends Config {
	private configObj: IConfigObject;

    constructor() {
		super();
        dotenv.config({ path: path.join(__dirname, '../../../../.env') });
        this.configObj = {
            port: parseInt(process.env.PORT) || 80,
            dbUrl: process.env.DB_URL,
            publicKeyPath: process.env.PUBLIC_KEY_PATH,
			logFilePath: process.env.LOG_FILE_PATH? 
				path.join(__dirname, `../../../../${process.env.LOG_FILE_PATH}`)
				: path.join(__dirname, `../../../../logs/app.log`),
			appName: process.env.APP_NAME || 'TSApp',
			nodeENV: process.env.NODE_ENV || "development",
			fileRepoUrl: process.env.FILE_REPO_URL,
			postTypes: process.env.POST_TYPES? process.env.POST_TYPES.split(',') : ['default']
        };
    }
	
	config(): IConfigObject {
		return this.configObj;
	}

	/**
	 * Function to get an app configuration attribute
	 * @param key Key of the configuration attribute requested
	 */
	public get(key: keyof IConfigObject): any {
		// console.log(key, this.config[key], this.config);
		return this.configObj[key];
	}

	/**
	 * Function to accept an express app and return a new app with mounted configuration
	 * @param _express The express Application to mount the configuration to
	 */
	public init (_express: Application): Application {
		_express.locals.app = this.configObj;
		return _express;
	}
}

// export default Config

// module.export = config;
