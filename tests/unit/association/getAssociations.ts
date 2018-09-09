import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';
import { getAssociations } from '../../../controllers/association';

describe('Unit - Association - Get associations', () => {
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
            userID: 1
        };

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
        const associations = [
            Object.assign(association1, {
                toJSON: () => {
                    return association1;
                }
            }),
            Object.assign(association2, {
                toJSON: () => {
                    return association2;
                }
            })
        ];
        const dbGetAssociationFake = sinon.fake.returns(associations);
        sandbox.replace(models.Association, 'findAll', dbGetAssociationFake);

        // Should get array of associations
        // @ts-ignore
        const result = await getAssociations(req, res, next);
        expect(result).to.be.an('array');

        expect(result[0].id).to.equal(500);
        expect(result[0].user.id).to.equal(2);
        expect(result[0].user.foo).to.equal('bar');

        expect(result[1].id).to.equal(400);
        expect(result[1].user.id).to.equal(5);
        expect(result[1].user.foo).to.equal('bar2');
    });

    it('Retrieve as Carer', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = {
            userID: 1
        };

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
        const associations = [
            Object.assign(association1, {
                toJSON: () => {
                    return association1;
                }
            }),
            Object.assign(association2, {
                toJSON: () => {
                    return association2;
                }
            })
        ];
        const dbGetAssociationFake = sinon.fake.returns(associations);
        sandbox.replace(models.Association, 'findAll', dbGetAssociationFake);

        // Should get array of associations
        // @ts-ignore
        const result = await getAssociations(req, res, next);
        expect(result).to.be.an('array');

        expect(result[0].id).to.equal(600);
        expect(result[0].user.id).to.equal(8);
        expect(result[0].user.foo).to.equal('bar');

        expect(result[1].id).to.equal(700);
        expect(result[1].user.id).to.equal(9);
        expect(result[1].user.foo).to.equal('bar2');
    });

    it('Retrieve as Carer with no associations', async () => {
        // Request should have userID (user should be authenticated)
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

    afterEach(async () => {
        sandbox.restore();
    });
});
