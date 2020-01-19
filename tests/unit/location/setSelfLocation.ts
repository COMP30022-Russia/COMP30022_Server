import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { setSelfLocation } from '../../../controllers/location';
import models from '../../../models';

describe('Location - Set Location', () => {
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

    afterEach(async () => {
        sandbox.restore();
    });

    it('AP sets location', async () => {
        // Define set location spy
        const setLocationSpy = sinon.spy();

        // Fake get user call
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findByPk: sinon.fake.returns({
                    id: 1,
                    type: 'AP',
                    setCurrentLocation: setLocationSpy
                })
            };
        });

        // Fake create call
        sandbox.replace(models.Location, 'create', sinon.stub().returnsArg(0));

        // @ts-ignore
        const result = await setSelfLocation(req, res, next);

        // Expect success message to be returned
        expect(result).to.deep.equal({ status: 'success' });
        // Expect setLocation to receive given location and userId as object
        expect(setLocationSpy.getCall(0).args[0]).to.deep.equal({
            ...req.body,
            userId: req.userID
        });
    });

    it('Carer attempts to set location', async () => {
        // Fake get user call
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findByPk: sinon.fake.returns({
                    id: 1,
                    type: 'Carer'
                })
            };
        });

        // @ts-ignore
        const result = await setSelfLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Non-AP users cannot set their own location'
        );
    });

    it('AP attempts to set invalid location', async () => {
        // Fake get user call
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findByPk: sinon.fake.returns({
                    id: 1,
                    type: 'AP'
                })
            };
        });

        // Fake create call
        sandbox.replace(
            models.Location,
            'create',
            sinon.fake.throws(new Error('Insertion validation error'))
        );

        // @ts-ignore
        const result = await setSelfLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Insertion validation error');
    });
});
