import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getUserLocation } from '../../../controllers/location';
import models from '../../../models';

describe('Unit - Location - Get Associated AP Location', () => {
    const sandbox = sinon.createSandbox();

    it('Carer gets AP', async () => {
        // Define arbitary location
        const location: any = {
            lat: 34.2,
            lon: 12.3
        };

        // Request should have userID (requested userID)
        const req: any = {
            params: {
                userID: 1
            }
        };

        // Fake DB call
        const dbFake = sinon.fake.returns({
            id: 1,
            type: 'AP',
            getCurrentLocation: () => {
                return location;
            }
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFake };
        });

        // @ts-ignore
        const result = await getUserLocation(req, res, next);
        expect(result).to.deep.equal(location);
    });

    it('AP gets Carer', async () => {
        // Define arbitary location
        const location: any = {
            lat: 34.2,
            lon: 12.3
        };

        // Request should have userID (requested userID)
        const req: any = {
            params: {
                userID: 1
            }
        };

        // Fake DB call
        const dbFake = sinon.fake.returns({
            id: 1,
            type: 'Carer'
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFake };
        });

        // @ts-ignore
        const result = await getUserLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal("Only APs' locations can be accessed");
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
