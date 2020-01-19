import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { updateUserDetails } from '../../../controllers/user';
import models from '../../../models';

describe('User Details', () => {
    const sandbox = sinon.createSandbox();

    before(async () => {
        const user: any = {
            id: 1,
            type: 'AP'
        };

        // Fake DB call to return properties
        sandbox.replace(models.User, 'findByPk', (id: number) => {
            return {
                ...wrapToJSON(user),
                update: (attributes: any) => {
                    return wrapToJSON(attributes);
                }
            };
        });
    });

    after(async () => {
        sandbox.restore();
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
});
