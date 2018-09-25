import { expect, request } from 'chai';
import sinon from 'sinon';
import rewire from 'rewire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Navigation', () => {
    const sandbox = sinon.createSandbox();

    // Navigation controller
    let navigation: any;

    // Fake retrieve call
    const APID = '1';
    const BAD_APID = '2';

    const location = { lat: 10.23, lon: 203.4 };

    before(async () => {
        const getStub = sinon.stub();
        getStub.withArgs(APID).returns(location);
        getStub.withArgs(BAD_APID).returns(undefined);

        // Import the nav controller with stubbed locationCache
        navigation = rewire('../../../controllers/navigation_session');
        navigation.__set__('locationCache', { getItem: getStub });
    });

    it('Get cached AP location', async () => {
        const session = {
            id: 1,
            APId: 1,
            carerId: 2
        };
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session
        };

        // Expect lat/lon to be returned
        // @ts-ignore
        const result = await navigation.getAPLocation(req, res, next);
        expect(result).to.deep.equal(location);
    });

    it('Get AP location when there is no location', async () => {
        const session = {
            id: 1,
            APId: 2,
            carerId: 2
        };
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session
        };

        // Expect error
        // @ts-ignore
        const result = await navigation.getAPLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('AP location has not been set');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
