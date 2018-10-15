import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import models from '../../../models';
import { ensureRequestedUserIsAssociated } from '../../../middleware/association';

describe('Unit - Middleware - Ensure Requested User is Associated', () => {
    const sandbox = sinon.createSandbox();

    // Request with valid param
    const req = {
        userID: 2,
        params: {
            userID: 3
        }
    };

    it('Is associated', async () => {
        // Fake DB find
        const dbFake = sinon.fake.returns({
            id: 1
        });
        sandbox.replace(models.Association, 'findOne', dbFake);

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, expect next() to be called with 0 arguments
        // @ts-ignore
        await ensureRequestedUserIsAssociated(req, res, nextSpy);
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Is same user', async () => {
        // Fake DB find
        const dbFake = sinon.fake.returns({
            id: 1
        });
        sandbox.replace(models.Association, 'findOne', dbFake);

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, expect next() to be called with 0 arguments
        await ensureRequestedUserIsAssociated(
            // @ts-ignore
            { ...req, userID: 3 },
            res,
            nextSpy
        );
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Is not associated', async () => {
        // Fake DB find
        // tslint:disable:no-null-keyword / DB will return null here
        const dbFake = sinon.fake.returns(null);
        sandbox.replace(models.Association, 'findOne', dbFake);

        // Call middleware, expect next(err) to be returned
        // @ts-ignore
        const result = await ensureRequestedUserIsAssociated(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('User is not party of association');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
