import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import Config from '../../src/app/providers/config/Config';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../src/app/types';
import { Mockgoose } from 'mockgoose';
import { Database } from '../../src/app/database/Database';

@injectable()
export class TestMongooseDatabase implements Database {
	constructor(@inject(TYPES.Config) private _config: Config) { }
	init() {
		// const dsn = this._config.get('dbUrl');
		const options = { useNewUrlParser: true, useUnifiedTopology: true };
		// if (!dsn)
		// 	throw new Error('DB URL not set in configuration');
		(<any>mongoose).Promise = global.Promise;
		mongoose.set('useCreateIndex', true);
		mongoose.set('useFindAndModify', false);
		let mockgoose = new Mockgoose(mongoose);
		// mockgoose.helper.setDbVersion('4.2');
		const dsn = mockgoose.getMockConnectionString('27017');
		console.log("USING TEST DATABASE", dsn);
		mockgoose.prepareStorage().then(function () {
			console.log("STORAGE PREPARED");
			mongoose.connect(dsn, options, (error: MongoError) => {
				// handle the error case
				if (error) {
					// Log.info('Failed to connect to the Mongo server!!');
					console.log(error);
					throw error;
				}
				else {
					console.log("Test Database Connected!");
					// Log.info('connected to mongo server at: ' + dsn);
				}
			});
		});
	}
}
