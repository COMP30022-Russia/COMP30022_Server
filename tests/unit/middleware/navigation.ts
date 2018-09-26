import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import models from '../../../models';
import { retrieveNavigationSession } from '../../../middleware/navigation';

describe('Unit - Middleware - Ensure Requested User is in Session', () => {
    const sandbox = sinon.createSandbox();

    // Request
    const req = {
        userID: 1,
        params: {
            sessionID: 2
        }
    };

    it('Is in active session', async () => {
        // Fake DB find
        const dbFake = sinon.fake.returns({
            id: 3,
            active: true
        });
        sandbox.replace(models.Session, 'findOne', dbFake);

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, expect next() to be called with 0 arguments
        // @ts-ignore
        await retrieveNavigationSession([])(req, res, nextSpy);
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Is not in session', async () => {
        // Fake DB find
        sandbox.replace(models.Session, 'findOne', sinon.fake());

        // Call middleware, expect next(err) to be returned
        // @ts-ignore
        const result = await retrieveNavigationSession([])(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'User is not party of navigation session or session does not exist'
        );
    });

    it('Is in inactive session', async () => {
        // Fake DB find
        const dbFake = sinon.fake.returns({
            id: 3,
            active: false
        });
        sandbox.replace(models.Session, 'findOne', dbFake);

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, expect next() to be called with 0 arguments
        // @ts-ignore
        const result = await retrieveNavigationSession([])(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Session has already ended');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
