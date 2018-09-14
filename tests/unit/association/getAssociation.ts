import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';
import { getAssociation } from '../../../controllers/association';

describe('Unit - Association - Get specific association', () => {
    const sandbox = sinon.createSandbox();

    // Fake DB find type of user call
    const dbFakeAP = sinon.fake.returns({
        id: 1,
        type: 'AP'
    });
    const dbFakeCarer = sinon.fake.returns({
        id: 1,
        type: 'Carer'
    });

    it('Retrieve as AP', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = {
            userID: 1,
            params: { associationID: 1 }
        };

        // Fake query for finding type of user
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeAP };
        });

        // Fake query for retrieving association
        const associationValue = {
            id: 500,
            Carer: {
                id: 2,
                foo: 'bar'
            }
        };
        const dbGetAssociationFake = sinon.fake.returns({
            ...associationValue,
            toJSON: () => {
                return associationValue;
            }
        });
        sandbox.replace(models.Association, 'findOne', dbGetAssociationFake);

        // @ts-ignore
        const result = await getAssociation(req, res, next);
        // Association ID
        expect(result.id).to.equal(associationValue.id);
        // Associated user data (the associated carer's data)
        expect(result.user.id).to.equal(associationValue.Carer.id);
        expect(result.user.foo).to.equal(associationValue.Carer.foo);
    });

    it('Retrieve as Carer', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = {
            userID: 2,
            params: { associationID: 1 }
        };

        // Fake query for finding type of user
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeCarer };
        });

        // Fake query for retrieving association
        const associationValue = {
            id: 500,
            AP: {
                id: 1,
                foo: 'bar'
            }
        };
        const dbGetAssociationFake = sinon.fake.returns({
            ...associationValue,
            toJSON: () => {
                return associationValue;
            }
        });
        sandbox.replace(models.Association, 'findOne', dbGetAssociationFake);

        // @ts-ignore
        const result = await getAssociation(req, res, next);
        // Association ID
        expect(result.id).to.equal(associationValue.id);
        // Associated user data (the associated AP's data)
        expect(result.user.id).to.equal(associationValue.AP.id);
        expect(result.user.foo).to.equal(associationValue.AP.foo);
    });

    it('Retrieve as Carer without being member of association', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = {
            userID: 2,
            params: { associationID: 1 }
        };

        // Fake query for finding type of user
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeCarer };
        });

        // Fake query for retrieving association
        // When no association exists, return null
        const dbGetAssociationFake = sinon.fake();
        sandbox.replace(models.Association, 'findOne', dbGetAssociationFake);

        // @ts-ignore
        const result = await getAssociation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Association is inactive, non-existant or user is not a member of the requested association'
        );
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
