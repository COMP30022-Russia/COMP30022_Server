import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { getAssociatedUserDetails } from '../../../controllers/user';
import models from '../../../models';

describe('User Details', () => {
    const sandbox = sinon.createSandbox();

    afterEach(async () => {
        sandbox.restore();
    });

    it('Get AP Details', async () => {
        // Define arbitary location
        const location: any = {
            lat: 12.3,
            lon: 45.6
        };
        // Define a portion of the info that is returned by DB
        const userInfo: any = {
            id: 1,
            type: 'AP'
        };

        // Params should have target userID
        const req: any = {
            params: {
                userID: 1
            }
        };

        // Fake DB call to return user info and getCurrentLocation() function
        const dbFake = sinon.fake.returns({
            getCurrentLocation: () => {
                return location;
            },
            ...wrapToJSON(userInfo)
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findByPk: dbFake };
        });

        // @ts-ignore
        const result = await getAssociatedUserDetails(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('type');
        expect(result).to.have.property('location');
        expect(result.id).to.equal(req.params.userID);
        expect(result.type).to.equal(userInfo.type);
        expect(result.location).to.deep.equal(location);
    });

    it('Get carer Details', async () => {
        // Params should have target userID
        const req: any = {
            params: {
                userID: 1
            }
        };

        // Define a portion of the info that is returned by DB
        const userInfo: any = {
            id: 1,
            type: 'Carer'
        };
        // Fake DB call to return the fake info
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findByPk: sinon.fake.returns(wrapToJSON(userInfo)) };
        });

        // @ts-ignore
        const result = await getAssociatedUserDetails(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('type');
        expect(result.id).to.equal(req.params.userID);
        expect(result.type).to.equal(userInfo.type);
    });
});
