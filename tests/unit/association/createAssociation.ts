import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';

describe('Association - Create association', () => {
    const sandbox = sinon.createSandbox();

    // Association controller
    let association: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    const GOOD_TOKEN = '42';
    const NON_ASSOC_TOKEN = 'non_assoc_token';
    const BAD_TOKEN = 'bad_token';
    const REQUEST_USER_ID = 1;
    const CREATED_ASSOCIATION_ID = 99;

    before(async () => {
        // Stub JWT sign function to return '1234'
        const jwtVerifyStub = sandbox.stub();
        jwtVerifyStub.withArgs(GOOD_TOKEN).returns({
            type: 'Association',
            userID: REQUEST_USER_ID
        });
        jwtVerifyStub.withArgs(NON_ASSOC_TOKEN).returns({
            userID: REQUEST_USER_ID
        });
        jwtVerifyStub.withArgs(BAD_TOKEN).throws('Invalid token error');

        // Import the association controllers with the jwtSign function stubbed
        // and a spy on the notification sending function
        association = proxyquire('../../../controllers/association', {
            '../helpers/jwt': { jwtVerify: jwtVerifyStub },
            './notification/association': { sendAssociationMessage: sendSpy }
        });
    });

    beforeEach(async () => {
        // Fake association find
        sandbox.replace(models.Association, 'find', sinon.fake());

        // Replace association creation function
        sandbox.replace(
            models.Association,
            'create',
            sinon.stub().returns(wrapToJSON({ id: CREATED_ASSOCIATION_ID }))
        );
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Create association as AP', async () => {
        // Association requests have association token in body
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

        // Create association
        const result = await association.createAssociation(req, res, next);
        expect(result).to.have.property('id');
        expect(result.id).to.equal(CREATED_ASSOCIATION_ID);

        // Expect the send message spy to be called with REQUEST_USER_ID
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.alwaysCalledWith(REQUEST_USER_ID)).to.equal(true);
    });

    it('Create association as Carer', async () => {
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

        // Create association
        const result = await association.createAssociation(req, res, next);
        expect(result).to.have.property('id');
        expect(result.id).to.equal(CREATED_ASSOCIATION_ID);
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
});
