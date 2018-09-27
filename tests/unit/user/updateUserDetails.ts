import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { updateUserDetails } from '../../../controllers/user';
import models from '../../../models';

describe('Unit - User Details', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(async () => {
        const user: any = {
            id: 1,
            type: 'AP'
        };

        // Fake DB call to return properties
        sandbox.replace(models.User, 'findById', (id: number) => {
            return {
                ...user,
                toJSON: () => user,
                updateAttributes: (attributes: any) => {
                    return {
                        ...attributes,
                        toJSON: () => attributes
                    };
                }
            };
        });
    });

    it('Update nothing', async () => {
        // Empty body
        const req: any = {
            params: {
                userID: 1
            },
            body: {}
        };

        // @ts-ignore
        const result = await updateUserDetails(req, res, next);
        expect(result).to.deep.equal(req.body);
    });

    it('Update bad fields', async () => {
        const req: any = {
            params: {
                userID: 1
            },
            body: { type: 'AP', username: 'foo', foo: 'bar' }
        };

        // @ts-ignore
        const result = await updateUserDetails(req, res, next);
        expect(result).to.deep.equal({});
    });

    it('Update good fields', async () => {
        // Define every field that can be updated
        const modifications: any = {
            name: 'foo',
            mobileNumber: '20',
            DOB: '2018-12-10',
            emergencyContactName: 'fizz',
            emergencyContactNumber: '25',
            address: 'buzz',
            password: 'foo'
        };
        const req: any = {
            params: {
                userID: 1
            },
            body: modifications
        };

        // @ts-ignore
        const result = await updateUserDetails(req, res, next);
        expect(result).to.deep.equal(modifications);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
