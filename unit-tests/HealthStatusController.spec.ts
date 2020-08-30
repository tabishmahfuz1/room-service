import { expect } from "chai";
import { container } from "../src/app/inversify.config";
import { HealthStatusController } from "../src/app/controllers/HealthStatusController";

describe('HealthStatusController', () => {
    /**
     * Prepare the environment for tests in the before() and beforeEach() methods */   
    before(async () => {
        //  container.rebind<Database>(TYPES.Database).to(TestMongooseDatabase);
    })

     beforeEach((done) => {
        /**
         * Do something before each test
         */
        done();
    });

    it('Checks HealthStatus Controller Function', done => {
        // let controller = container.get(HealthStatusController);
        container.get(HealthStatusController).handle({})
            .then( res => {
                expect(res).to.be.a('string').eql('OK');
                done();
            });
    });
});