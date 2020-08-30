import 'mocha';
let chai       = require('chai');
let should     = chai.should();
let chaiHttp   = require('chai-http');
chai.use(chaiHttp);
import { App } from '../src/app/App';
import { container } from '../src/app/inversify.config';
import { expect } from 'chai';
import { ReadyStatusController } from '../src/app/controllers/ReadyStatusController';
import { Database } from '../src/app/database/Database';
import { TYPES } from '../src/app/types';
import { TestMongooseDatabase } from './mocks/TestMongooseDatabase';

describe('ReadyStatusController', () => {
    /**
     * Prepare the environment for tests in the before() and beforeEach() methods */     
    let app;
    before(async () => {
         container.rebind<Database>(TYPES.Database).to(TestMongooseDatabase);
         app = container.get(App);
    })

    it('Checks ReadyStatus API', done => {
        chai.request(app.express)
                .get('/ready')
                .end((err, res) => {
                    res.should.have.status(200);
                    // console.log(res.body)
                    res.body.should.be.a('Object');
                    res.body.status.should.be.a('string').eql('success');

                    res.body.response.should.be.a('string')
                            .eql('OK');
                    done();
                });
    });
});