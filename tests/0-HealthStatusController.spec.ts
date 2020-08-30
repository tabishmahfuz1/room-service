import 'mocha';
let chai       = require('chai');
let should     = chai.should();
let chaiHttp   = require('chai-http');
chai.use(chaiHttp);
import { App } from '../src/app/App';
import { container } from '../src/app/inversify.config';
import { HealthStatusController } from '../src/app/controllers/HealthStatusController';
import { expect } from 'chai';
import { Database } from '../src/app/database/Database';
import { TYPES } from '../src/app/types';
import { TestMongooseDatabase } from './mocks/TestMongooseDatabase';

describe('HealthStatusController', () => {
    /**
     * Prepare the environment for tests in the before() and beforeEach() methods */     
    let app;
    before(async () => {
         container.rebind<Database>(TYPES.Database).to(TestMongooseDatabase);
         app = container.get(App);
    })

     beforeEach((done) => {
        /**
         * Do something before each test
         */
        done();
    });

    it('Checks HealthStatus API', done => {
        chai.request(app.express)
                .get('/health')
                .end((err, res) => {
                    res.should.have.status(200);
    
                    res.body.should.be.a('Object');
                    res.body.status.should.be.a('string').eql('success');

                    res.body.response.should.be.a('string')
                            .eql('OK');
                    done();
                });
    });
});