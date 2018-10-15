import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import models from '../../../models';
import { retrieveAssociation } from '../../../middleware/association';

describe('Unit - Middleware - Ensure user is in requested association', () => {
    const sandbox = sinon.createSandbox();

    // Request with valid param
    const req = {
        userID: 2,
        params: {
            associationID: 1
        }
    };

    it('Is in association', async () => {
        // Fake DB find
        const dbFake = sinon.fake.returns({
            id: 1
        });
        sandbox.replace(models.Association, 'findOne', dbFake);

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, expect next() to be called with 0 arguments
        // @ts-ignore
        await retrieveAssociation(req, res, nextSpy);
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Is not in association', async () => {
        // Fake DB find
        // tslint:disable:no-null-keyword / DB will return null here
        const dbFake = sinon.fake.returns(null);
        sandbox.replace(models.Association, 'findOne', dbFake);

        // Call middleware, expect next(err) to be returned
        // @ts-ignore
        const result = await retrieveAssociation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'User is not party of requested association'
        );
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
