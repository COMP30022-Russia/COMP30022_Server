import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';
import { getAssociations } from '../../../controllers/association';

describe('Association - Get associations', () => {
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

    afterEach(async () => {
        sandbox.restore();
    });

    it('Retrieve as AP', async () => {
        const req: any = { userID: 1 };

        // Fake query for finding type of user
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeAP };
        });

        // Fake query for associations retrieval query
        const association1 = {
            id: 500,
            Carer: {
                id: 2,
                foo: 'bar'
            }
        };
        const association2 = {
            id: 400,
            Carer: {
                id: 5,
                foo: 'bar2'
            }
        };
        sandbox.replace(
            models.Association,
            'findAll',
            sinon.fake.returns([
                wrapToJSON(association1),
                wrapToJSON(association2)
            ])
        );

        // Should get array of associations
        // @ts-ignore
        const result = await getAssociations(req, res, next);
        expect(result).to.be.an('array');

        expect(result[0].id).to.equal(association1.id);
        expect(result[0].user.id).to.equal(association1.Carer.id);
        expect(result[0].user.foo).to.equal(association1.Carer.foo);

        expect(result[1].id).to.equal(association2.id);
        expect(result[1].user.id).to.equal(association2.Carer.id);
        expect(result[1].user.foo).to.equal(association2.Carer.foo);
    });

    it('Retrieve as Carer', async () => {
        const req: any = { userID: 1 };

        // Fake query for finding type of user
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeCarer };
        });

        // Fake query for associations retrieval query
        const association1 = {
            id: 600,
            AP: {
                id: 8,
                foo: 'bar'
            }
        };
        const association2 = {
            id: 700,
            AP: {
                id: 9,
                foo: 'bar2'
            }
        };
        sandbox.replace(
            models.Association,
            'findAll',
            sinon.fake.returns([
                wrapToJSON(association1),
                wrapToJSON(association2)
            ])
        );

        // Should get array of associations
        // @ts-ignore
        const result = await getAssociations(req, res, next);
        expect(result).to.be.an('array');

        expect(result[0].id).to.equal(association1.id);
        expect(result[0].user.id).to.equal(association1.AP.id);
        expect(result[0].user.foo).to.equal(association1.AP.foo);

        expect(result[1].id).to.equal(association2.id);
        expect(result[1].user.id).to.equal(association2.AP.id);
        expect(result[1].user.foo).to.equal(association2.AP.foo);
    });

    it('Retrieve as Carer with no associations', async () => {
        const req: any = {
            userID: 2,
            params: { associationID: 1 }
        };

        // Fake query for finding type of user
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeCarer };
        });

        // Fake query for retrieving associations
        // When no associations exists, return null
        const dbGetAssociationFake = sinon.fake();
        sandbox.replace(models.Association, 'findAll', dbGetAssociationFake);

        // Expect result to be an array of length 0
        // @ts-ignore
        const result = await getAssociations(req, res, next);
        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(0);
    });
});
