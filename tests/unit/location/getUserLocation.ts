import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { getUserLocation } from '../../../controllers/location';
import models from '../../../models';

describe('Location - Get Associated AP Location', () => {
    const sandbox = sinon.createSandbox();

    afterEach(async () => {
        sandbox.restore();
    });

    it('Carer gets AP', async () => {
        const req: any = {
            params: {
                userID: 1
            }
        };

        // Define arbitary location
        const location: any = {
            lat: 34.2,
            lon: 12.3
        };

        // Fake DB call
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findById: sinon.fake.returns({
                    id: 1,
                    type: 'AP',
                    getCurrentLocation: () => wrapToJSON(location)
                })
            };
        });

        // @ts-ignore
        const result = await getUserLocation(req, res, next);
        expect(result).to.deep.equal(location);
    });

    it('AP gets Carer', async () => {
        const req: any = {
            params: {
                userID: 1
            }
        };

        // Fake DB call
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findById: sinon.fake.returns({
                    id: 1,
                    type: 'Carer'
                })
            };
        });

        // @ts-ignore
        const result = await getUserLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal("Only APs' locations can be accessed");
    });
});
