import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import models from '../../../models';
import { ensureUserIsInNavigationSession } from '../../../middleware/auth';

describe('Unit - Middleware - Ensure Requested User is in Session', () => {
    const sandbox = sinon.createSandbox();

    // Request
    const req = {
        userID: 1,
        params: {
            sessionID: 2
        }
    };

    it('Is in session', async () => {
        // Fake DB find
        const dbFake = sinon.fake.returns({
            id: 3
        });
        sandbox.replace(models.Session, 'findOne', dbFake);

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, expect next() to be called with 0 arguments
        // @ts-ignore
        await ensureUserIsInNavigationSession(req, res, nextSpy);
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Is not in session', async () => {
        // Fake DB find
        sandbox.replace(models.Session, 'findOne', sinon.fake());

        // Call middleware, expect next(err) to be returned
        // @ts-ignore
        const result = await ensureUserIsInNavigationSession(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'User is not party of navigation session or session does not exist'
        );
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
