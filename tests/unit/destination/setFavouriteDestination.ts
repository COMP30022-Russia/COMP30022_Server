import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { setFavouriteDestination } from '../../../controllers/destination';
import models from '../../../models';

describe('Destination - Set favourite destination', () => {
    const sandbox = sinon.createSandbox();

    // ID for fail query
    const FAIL_ID = 0;

    // Temporaraily stores rearranged parameters of last DB call
    let callParameters: { favourite: boolean; id: number; userId: number };

    before(async () => {
        // Fake DB call
        sandbox.replace(
            models.Destination,
            'update',
            (
                attribute: { favourite: boolean },
                options: { where: { id: number; userId: number } }
            ) => {
                // Set call parameters
                callParameters = { ...attribute, ...options.where };

                // Return varying response depending on parameter received
                if (options.where.id === FAIL_ID) {
                    return [0];
                } else {
                    return [1];
                }
            }
        );
    });

    after(async () => {
        sandbox.restore();
    });

    it('Non existant destination', async () => {
        // Request should have userID, destinationID
        const req: any = {
            params: { userID: 1, destinationID: FAIL_ID },
            query: {}
        };

        // @ts-ignore Mock request
        const result = await setFavouriteDestination(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Destination does not exist');
    });

    it('Set favourite non-explicitly', async () => {
        // Request should have userID, destinationID
        const req: any = {
            params: { userID: 1, destinationID: 2 },
            query: {}
        };

        // @ts-ignore Mock request
        const result = await setFavouriteDestination(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        expect(callParameters.favourite).to.equal(true);
        expect(callParameters.id).to.equal(req.params.destinationID);
        expect(callParameters.userId).to.equal(req.params.userID);
    });

    it('Set favourite explicitly', async () => {
        // Request should have userID, destinationID
        const req: any = {
            params: { userID: 1, destinationID: 2 },
            query: { favourite: 'true' }
        };

        // @ts-ignore Mock request
        const result = await setFavouriteDestination(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        expect(callParameters.favourite).to.equal(true);
        expect(callParameters.id).to.equal(req.params.destinationID);
        expect(callParameters.userId).to.equal(req.params.userID);
    });

    it('Unset favourite explicitly', async () => {
        // Request should have userID, destinationID
        const req: any = {
            params: { userID: 1, destinationID: 2 },
            query: { favourite: 'false' }
        };

        // @ts-ignore Mock request
        const result = await setFavouriteDestination(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        expect(callParameters.favourite).to.equal(false);
        expect(callParameters.id).to.equal(req.params.destinationID);
        expect(callParameters.userId).to.equal(req.params.userID);
    });
});
