import { expect, request } from 'chai';
import sinon from 'sinon';
import rewire from 'rewire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Navigation', () => {
    const sandbox = sinon.createSandbox();

    // Navigation controller
    let navigation: any;

    // Spy for item set
    const setSpy = sinon.spy();

    // Spy for message sending
    const sendSpy = sinon.spy();

    const CACHED_APID = 1;
    const NON_CACHED_APID = 2;

    // Data returned by cache
    const cachedData = { lat: 10.23, lon: 203.4, targetID: 1 };

    before(async () => {
        const getStub = sinon.stub();
        getStub.withArgs(String(CACHED_APID)).returns(cachedData);
        getStub.withArgs(String(NON_CACHED_APID)).returns(undefined);

        // Import the nav controller with stubbed locationCache
        navigation = rewire('../../../controllers/navigation_session');
        navigation.__set__('locationCache', {
            getItem: getStub,
            setItem: setSpy
        });
        navigation.__set__('sendLocationMessage', sendSpy);
    });

    it('Update location with bad lat/lon', async () => {
        const req = {
            userID: CACHED_APID,
            params: {
                sessionID: 1
            },
            body: {
                lon: 2
            }
        };

        // Expect error
        // @ts-ignore
        const result = await navigation.updateAPLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('lat/lon missing');
    });

    it('Update cached AP location', async () => {
        const req = {
            userID: CACHED_APID,
            params: {
                sessionID: 1
            },
            body: {
                lat: 1,
                lon: 2
            }
        };

        // Expect success message
        // @ts-ignore
        const result = await navigation.updateAPLocation(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });

        // Check cache set
        expect(setSpy.lastCall.args[0]).to.equal(String(req.userID));
        expect(setSpy.lastCall.args[1]).to.deep.equal({
            targetID: cachedData.targetID,
            ...req.body
        });

        // Check sent message
        expect(sendSpy.lastCall.args[0]).to.equal(cachedData.targetID);
        expect(sendSpy.lastCall.args[1]).to.equal(req.params.sessionID);
        expect(sendSpy.lastCall.args[2]).to.equal(req.body.lat);
        expect(sendSpy.lastCall.args[3]).to.equal(req.body.lon);
    });

    it('Update uncached AP location - Bad session', async () => {
        const req = {
            userID: NON_CACHED_APID,
            params: {
                sessionID: 1
            },
            body: {
                lat: 1,
                lon: 2
            }
        };

        // Replace findOne query to return null
        sandbox.replace(models.Session, 'findOne', sinon.fake());

        // Expect error
        // @ts-ignore
        const result = await navigation.updateAPLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Session is inactive or invalid');
    });

    it('Update uncached AP location - Requester is not AP', async () => {
        const req = {
            userID: NON_CACHED_APID,
            params: {
                sessionID: 1
            },
            body: {
                lat: 1,
                lon: 2
            }
        };

        // Replace findOne query to return situation where requester is not AP
        sandbox.replace(
            models.Session,
            'findOne',
            sinon.stub().returns({ APId: 1, carerId: 2 })
        );

        // Expect error
        // @ts-ignore
        const result = await navigation.updateAPLocation(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Non-AP users are not allowed to set location'
        );
    });

    it('Update uncached AP location', async () => {
        const CARER_ID = 3;
        const req = {
            userID: NON_CACHED_APID,
            params: {
                sessionID: 1
            },
            body: {
                lat: 100,
                lon: 101
            }
        };

        // Replace findOne query to return situation where requester is not AP
        sandbox.replace(
            models.Session,
            'findOne',
            sinon.stub().returns({ APId: NON_CACHED_APID, carerId: CARER_ID })
        );

        // Expect success message
        // @ts-ignore
        const result = await navigation.updateAPLocation(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });

        // Check cache set
        expect(setSpy.lastCall.args[0]).to.equal(String(req.userID));
        expect(setSpy.lastCall.args[1]).to.deep.equal({
            targetID: CARER_ID,
            ...req.body
        });

        // Check sent message
        expect(sendSpy.lastCall.args[0]).to.equal(CARER_ID);
        expect(sendSpy.lastCall.args[1]).to.equal(req.params.sessionID);
        expect(sendSpy.lastCall.args[2]).to.equal(req.body.lat);
        expect(sendSpy.lastCall.args[3]).to.equal(req.body.lon);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
