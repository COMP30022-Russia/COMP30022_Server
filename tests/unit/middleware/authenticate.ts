import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import { res } from '../index';
import models from '../../../models';

describe('Unit - Middleware - Authenticate', () => {
    const sandbox = sinon.createSandbox();
    let auth: any;

    before(async () => {
        // Stub JWT sign function to return '1234'
        const JWTVerifyStub = sandbox.stub();
        JWTVerifyStub.withArgs('1234').returns({ id: 1 });
        JWTVerifyStub.throws();
        // Import the user controllers with the jwt_sign function stubbed
        auth = proxyquire('../../../middleware/authenticate', {
            '../helpers/jwt': { jwt_verify: JWTVerifyStub }
        });
    });

    it('Valid', async () => {
        // Define spy for next()
        const nextSpy = sinon.spy();

        const req = {
            headers: {
                authorization: 'Bearer 1234'
            }
        };

        // Call middleware, with a valid authorization header
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.calledWithExactly()).to.equal(true);
    });

    it('Header missing', async () => {
        // Define spy for next()
        const nextSpy = sinon.spy();

        const req = {
            headers: {}
        };

        // Call middleware, with a missing authorization header
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.getCall(0).args).to.have.lengthOf(1);
        expect(nextSpy.getCall(0).args[0]).to.be.an('error');
        expect(nextSpy.getCall(0).args[0].message).to.equal(
            'Authorization header missing or incorrect'
        );
    });

    it('Header invalid', async () => {
        // Define spy for next()
        const nextSpy = sinon.spy();

        const req = {
            headers: {
                authorization: '1234'
            }
        };

        // Call middleware, with an invalid authorization header
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.getCall(0).args).to.have.lengthOf(1);
        expect(nextSpy.getCall(0).args[0]).to.be.an('error');
        expect(nextSpy.getCall(0).args[0].message).to.equal(
            'Authorization header missing or incorrect'
        );
    });

    it('Header token incorrect', async () => {
        // Define spy for next()
        const nextSpy = sinon.spy();

        const req = {
            headers: {
                authorization: 'Bearer 12345'
            }
        };

        // Call middleware, with an invalid token
        // @ts-ignore
        await auth.authenticate(req, res, nextSpy);
        expect(nextSpy.getCall(0).args).to.have.lengthOf(1);
        expect(nextSpy.getCall(0).args[0]).to.be.an('error');
        expect(nextSpy.getCall(0).args[0].message).to.equal(
            'Token could not be verified'
        );
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
