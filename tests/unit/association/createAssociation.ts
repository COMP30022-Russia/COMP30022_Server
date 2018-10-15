import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';

describe('Unit - Association - Create association', () => {
    let association: any;
    const sandbox = sinon.createSandbox();

    // Fake association tokens
    const GOOD_TOKEN = '42';
    const NON_ASSOC_TOKEN = 'non_assoc_token';
    const BAD_TOKEN = 'bad_token';
    const REQUEST_USER_ID: number = 1;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    before(async () => {
        // Stub JWT sign function to return '1234'
        const JWTVerifyStub = sandbox.stub();
        JWTVerifyStub.withArgs(GOOD_TOKEN).returns({
            type: 'Association',
            userID: REQUEST_USER_ID
        });
        JWTVerifyStub.withArgs(NON_ASSOC_TOKEN).returns({
            userID: REQUEST_USER_ID
        });
        JWTVerifyStub.withArgs(BAD_TOKEN).throws('Invalid token error');

        // Import the association controllers with the jwt_sign function stubbed
        // and a spy on the notification sending function
        association = proxyquire('../../../controllers/association', {
            '../helpers/jwt': { jwt_verify: JWTVerifyStub },
            './notification/association': { default: sendSpy }
        });
    });

    it('Create association as AP', async () => {
        // Association requests have association tokens
        const req = {
            body: {
                token: GOOD_TOKEN
            },
            userID: 2
        };

        // Fake find type queries
        const dbFindTypeFake = sinon.stub();
        dbFindTypeFake.onCall(0).returns({ type: 'AP' });
        dbFindTypeFake.onCall(1).returns({ type: 'Carer' });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFindTypeFake };
        });

        // Fake association find
        sandbox.replace(models.Association, 'find', sinon.fake());

        // Replace association creation function
        const associationID = 1;
        sandbox.replace(
            models.Association,
            'create',
            sinon.stub().returns(wrapToJSON({ id: associationID }))
        );

        const result = await association.createAssociation(req, res, next);
        expect(result).to.have.property('id');
        expect(result.id).to.equal(associationID);

        // Expect the send message spy to be called with REQUEST_USER_ID
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.alwaysCalledWith(REQUEST_USER_ID)).to.equal(true);
    });

    it('Create association as Carer', async () => {
        // Association requests have association tokens
        const req = {
            body: {
                token: GOOD_TOKEN
            },
            userID: 2
        };

        // Fake find type queries
        const dbFindTypeFake = sinon.stub();
        dbFindTypeFake.onCall(0).returns({ type: 'Carer' });
        dbFindTypeFake.onCall(1).returns({ type: 'AP' });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFindTypeFake };
        });

        // Fake association find
        sandbox.replace(models.Association, 'find', sinon.fake());

        // Replace association creation function
        const associationID = 1;
        sandbox.replace(
            models.Association,
            'create',
            sinon.stub().returns(wrapToJSON({ id: associationID }))
        );

        const result = await association.createAssociation(req, res, next);
        expect(result).to.have.property('id');
        expect(result.id).to.equal(associationID);
    });

    it('Bad token', async () => {
        // Perform request with bad/invalid token
        const req = {
            body: {
                token: 'bad_token'
            }
        };

        const result = await association.createAssociation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Token is invalid or expired');
    });

    it('Non-association token', async () => {
        // Perform request with token that should not be used for association
        const req = {
            body: {
                token: 'non_assoc_token'
            }
        };

        const result = await association.createAssociation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Token is invalid');
    });

    it('Create association with account of same type', async () => {
        // Association requests have association tokens
        const req = {
            body: {
                token: '42'
            },
            userID: 2
        };

        // Fake find type queries
        const dbFindTypeFake = sinon.stub();
        dbFindTypeFake.onCall(0).returns({ type: 'AP' });
        dbFindTypeFake.onCall(1).returns({ type: 'AP' });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFindTypeFake };
        });

        const result = await association.createAssociation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Accounts of the same type cannot be associated'
        );
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
