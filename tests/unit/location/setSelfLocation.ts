import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { setSelfLocation } from '../../../controllers/location';
import models from '../../../models';

describe('Unit - Location - Set Location', () => {
    const sandbox = sinon.createSandbox();

    // Define arbitary location
    const location: any = {
        lat: 34.2,
        lon: 12.3
    };

    // Request should have location and authenticated user ID
    const req: any = {
        body: {
            ...location
        },
        userID: 1
    };

    it('AP', async () => {
        // Define set location spy
        const setLocationSpy = sinon.spy();

        // Fake get user call
        const dbFakeGetUserByID = sinon.fake.returns({
            id: 1,
            type: 'AP',
            setCurrentLocation: setLocationSpy
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeGetUserByID };
        });

        // Fake create call
        const dbStubCreateLocation = sinon.stub().returnsArg(0);
        sandbox.replace(models.Location, 'create', dbStubCreateLocation);

        // @ts-ignore
        const result = await setSelfLocation(req, res, next);

        // Expect success message to be returned
        expect(result).to.deep.equal({ status: 'success' });
        // Expect setLocation to receive given location and userId as object
        expect(setLocationSpy.getCall(0).args[0]).to.deep.equal(
            Object.assign(req.body, { userId: 1 })
        );
    });

    it('Carer attempts to set location', async () => {
        // Fake get user call
        const dbFakeGetUserByID = sinon.fake.returns({
            id: 1,
            type: 'Carer'
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeGetUserByID };
        });

        // @ts-ignore
        const result = await setSelfLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Non-AP users cannot set their own location'
        );
    });

    it('AP attempts to set invalid location', async () => {
        const badLocation = { lat: 100 };

        // Fake get user call
        const dbFakeGetUserByID = sinon.fake.returns({
            id: 1,
            type: 'AP'
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFakeGetUserByID };
        });

        // Fake create call
        const dbStubCreateLocation = sinon.fake.throws(
            new Error('DB insertion validation error')
        );
        sandbox.replace(models.Location, 'create', dbStubCreateLocation);

        // @ts-ignore
        const result = await setSelfLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('DB insertion validation error');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
