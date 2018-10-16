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
            (isWalking: boolean, placeID: string, lat: number, lon: number) => {
                return { isWalking, placeID, lat, lon };
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

    it('Set destination - first time, walking', async () => {
        // Update attribute spy
        const updateSpy = sinon.spy(() => req.session.sync++);
        const setDestinationSpy = sinon.spy();

        // tslint:disable:no-null-keyword / DB will return null here
        const sync = 8;
        const req = {
            userID: 1,
            params: {
                sessionID: 5
            },
            session: {
                id: 10,
                APId: 1,
                carerId: 2,
                updateAttributes: updateSpy,
                setDestination: setDestinationSpy,
                getDestination: sinon.stub().returns(null),
                sync
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
            state: 'Started',
            transportMode: 'Walking',
            route: {
                isWalking: true,
                placeID: req.body.placeID,
                lat: location.lat,
                lon: location.lon
            },
            sync: sync + 1
        });

        // Check the setDestination message
        expect(setDestinationSpy.calledOnce).to.equal(true);
        expect(setDestinationSpy.lastCall.args[0]).to.deep.equal({
            placeID: req.body.placeID,
            name: req.body.name,
            userId: req.session.APId
        });

        // Check the Firebase send message
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal(req.session.APId);
        expect(sendSpy.lastCall.args[1]).to.equal(req.session.carerId);
        expect(sendSpy.lastCall.args[2]).to.equal(req.session.id);
        expect(sendSpy.lastCall.args[3]).to.equal(sync + 1);
    });

    it('Set destination - subsequent times, public transport', async () => {
        // Attribute update spies
        const updateSessionSpy = sinon.spy(() => req.session.sync++);
        const updateDestinationSpy = sinon.spy();

        // tslint:disable:no-null-keyword / DB will return null here
        const sync = 8;
        const req = {
            userID: 1,
            params: {
                sessionID: 5
            },
            session: {
                id: 10,
                APId: 1,
                carerId: 2,
                updateAttributes: updateSessionSpy,
                getDestination: () => {
                    return {
                        updateAttributes: updateDestinationSpy
                    };
                },
                sync
            },
            body: { ...location, name: 'Hi', placeID: '1234', mode: 'PT' }
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
        expect(updateSessionSpy.calledOnce).to.equal(true);
        expect(updateSessionSpy.lastCall.args[0]).to.deep.equal({
            state: 'Started',
            transportMode: 'PT',
            route: {
                isWalking: false,
                placeID: req.body.placeID,
                lat: location.lat,
                lon: location.lon
            },
            sync: sync + 1
        });

        // First check the update route call
        expect(updateDestinationSpy.calledOnce).to.equal(true);
        expect(updateDestinationSpy.lastCall.args[0]).to.deep.equal({
            name: req.body.name,
            placeID: req.body.placeID
        });

        // Check the Firebase send message
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal(req.session.APId);
        expect(sendSpy.lastCall.args[1]).to.equal(req.session.carerId);
        expect(sendSpy.lastCall.args[2]).to.equal(req.session.id);
        expect(sendSpy.lastCall.args[3]).to.equal(sync + 1);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
