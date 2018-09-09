import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import proxyquire from 'proxyquire';

import models from '../../../models';

describe('Unit - Association - Create association', () => {
    const sandbox = sinon.createSandbox();
    let association: any;

    before(async () => {
        // Stub JWT sign function to return '1234'
        const JWTVerifyStub = sandbox.stub();
        JWTVerifyStub.withArgs('42').returns({
            type: 'Association',
            userID: 1
        });
        JWTVerifyStub.withArgs('non_assoc_token').returns({
            userID: 1
        });
        JWTVerifyStub.withArgs('bad_token').throws('Invalid token error');
        // Import the association controllers with the jwt_sign function stubbed
        association = proxyquire('../../../controllers/association', {
            '../helpers/jwt': { jwt_verify: JWTVerifyStub }
        });
    });

    it('Create association as AP', async () => {
        // Association requests have association tokens
        const req = {
            body: {
                token: '42'
            },
            userID: 1
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
        sandbox.replace(models.Association, 'create', sinon.fake());

        const result = await association.createAssociation(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');
    });

    it('Create association as Carer', async () => {
        // Association requests have association tokens
        const req = {
            body: {
                token: '42'
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
        sandbox.replace(models.Association, 'create', sinon.fake());

        const result = await association.createAssociation(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');
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
