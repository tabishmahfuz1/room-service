import { expect } from "chai";
import { ReadyStatusController } from "../src/app/controllers/ReadyStatusController";
import { container } from '../src/app/inversify.config';

describe('ReadyStatusController', () => {
    it('Checks HealthStatus Controller Function', done => {
        // (new ReadyStatusController()).handle({})
        (container.get(ReadyStatusController)).handle({})
            .then( res => {
                expect(res).to.be.a('string').eql('OK');
                done();
            });
    });
});