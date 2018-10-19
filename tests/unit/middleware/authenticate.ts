import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import { res } from '../index';

describe('Middleware - Authenticate', () => {
    const sandbox = sinon.createSandbox();

    // Auth controller
    let auth: any;

    before(async () => {
        // Stub JWT verify function to return { id: 1 }
        const jwtVerifyStub = sandbox.stub();
        jwtVerifyStub.withArgs('1234').returns({ id: 1 });
        jwtVerifyStub.throws();
        // Import the user controllers with the jwtVerify function stubbed
        auth = proxyquire('../../../middleware/authenticate', {
            '../helpers/jwt': { jwtVerify: jwtVerifyStub }
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Valid', async () => {
        const req = {
            headers: {
                authorization: 'Bearer 1234'
            }
        };

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, with a valid authorization header
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Header missing', async () => {
        const req = { headers: {} };

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, with a missing authorization header
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.equal(true);
        expect(nextSpy.lastCall.args).to.have.lengthOf(1);
        expect(nextSpy.lastCall.args[0]).to.be.an('error');
        expect(nextSpy.lastCall.args[0].message).to.equal(
            'Authorization header missing or incorrect'
        );
    });

    it('Header invalid', async () => {
        const req = {
            headers: {
                authorization: '1234'
            }
        };

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, with an invalid authorization header
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.equal(true);
        expect(nextSpy.lastCall.args).to.have.lengthOf(1);
        expect(nextSpy.lastCall.args[0]).to.be.an('error');
        expect(nextSpy.lastCall.args[0].message).to.equal(
            'Authorization header missing or incorrect'
        );
    });

    it('Header token incorrect', async () => {
        const req = {
            headers: {
                authorization: 'Bearer 12345'
            }
        };

        // Define spy for next()
        const nextSpy = sinon.spy();

        // Call middleware, with an invalid token
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.equal(true);
        expect(nextSpy.lastCall.args).to.have.lengthOf(1);
        expect(nextSpy.lastCall.args[0]).to.be.an('error');
        expect(nextSpy.lastCall.args[0].message).to.equal(
            'Token could not be verified'
        );
    });
});
