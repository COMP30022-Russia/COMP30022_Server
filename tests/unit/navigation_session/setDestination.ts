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

    // Location returned by cache
    const location = { lat: 10.23, lon: 203.4 };

    // Spy Firebase message send
    const sendSpy = sinon.spy();

    before(async () => {
        const getStub = sinon.stub();
        getStub.withArgs(APID).returns(location);
        getStub.withArgs(BAD_APID).returns(undefined);

        // Import the nav controller with stubbed locationCache
        navigation = rewire('../../../controllers/navigation_session');
        navigation.__set__('locationCache', { getItem: getStub });
        navigation.__set__(
            'getMapRoute',
            (mode: boolean, placeID: string, lat: number, lon: number) => {
                return { mode, placeID, lat, lon };
            }
        );
        navigation.__set__('sendRouteMessage', sendSpy);
    });

    it('Try to set destination without lon/lat', async () => {
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: {},
            body: {}
        };

        // Expect error
        // @ts-ignore
        const result = await navigation.setDestination(req, res, next);
        expect(result).be.an('error');
        expect(result.message).to.equal('Incorrect input parameters');
    });

    it('Try to set destination without placeID/name', async () => {
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: {},
            body: location
        };

        // Expect error
        // @ts-ignore
        const result = await navigation.setDestination(req, res, next);
        expect(result).be.an('error');
        expect(result.message).to.equal('Incorrect input parameters');
    });

    it('Try to set destination without having location', async () => {
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: {},
            body: { ...location, name: 'Hi', placeID: '1234' }
        };

        // Expect error
        // @ts-ignore
        const result = await navigation.setDestination(req, res, next);
        expect(result).be.an('error');
        expect(result.message).to.equal('AP location has not been set');
    });

    it('Set destination', async () => {
        // Update attribute spy
        const updateSpy = sinon.spy();
        const setDestinationSpy = sinon.spy();

        const req = {
            userID: 1,
            params: {
                sessionID: 5
            },
            session: {
                APId: 1,
                carerId: 2,
                updateAttributes: updateSpy,
                setDestination: setDestinationSpy
            },
            body: { ...location, name: 'Hi', placeID: '1234' }
        };

        // Stub destination creation function
        sandbox.replace(
            models.Destination,
            'create',
            sinon.stub().returnsArg(0)
        );

        // Expect error
        // @ts-ignore
        const result = await navigation.setDestination(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        // First check the update route call
        expect(updateSpy.calledOnce).to.equal(true);
        expect(updateSpy.lastCall.args[0]).to.deep.equal({
            mode: 'Walking',
            route: {
                mode: true,
                placeID: req.body.placeID,
                lat: location.lat,
                lon: location.lon
            }
        });

        // Check the setDestination message
        expect(setDestinationSpy.calledOnce).to.equal(true);
        expect(setDestinationSpy.lastCall.args[0]).to.deep.equal({
            placeID: req.body.placeID,
            name: req.body.name,
            userId: req.session.APId
        });

        // Check the Firebase send message
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.alwaysCalledWith(req.session.APId, req.session.carerId));
    });

    afterEach(async () => {
        sandbox.restore();
    });
});