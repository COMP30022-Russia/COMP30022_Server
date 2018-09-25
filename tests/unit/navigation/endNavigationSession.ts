import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Navigation - End navigation session', () => {
    const sandbox = sinon.createSandbox();

    // Navigation controller
    let navigation: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    // Spy for cache item deletino
    const deleteSpy = sinon.spy();

    before(async () => {
        // Import the nav controller with spies
        navigation = proxyquire('../../../controllers/navigation', {
            './notification/navigation': { sendNavigationEndMessage: sendSpy },
            './navigation_session': { locationCache: { deleteItem: deleteSpy } }
        });
    });

    it('End session', async () => {
        const updateSpy = sinon.spy();
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            active: true,
            updateAttributes: updateSpy
        };
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session
        };

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.endNavigationSession(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });
        expect(updateSpy.calledWithExactly({ active: false })).to.equal(true);

        // Verify the send message call
        // First argument: ID of opposite party
        // Second argument: ID of session
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.alwaysCalledWith(session.carerId, session.id)).to.equal(
            true
        );

        // Verify delete cache item call
        expect(deleteSpy.calledOnce).to.equal(true);
        expect(deleteSpy.alwaysCalledWith(String(session.APId))).to.equal(true);
    });

    it('End ended session', async () => {
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            active: false
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
        const result = await navigation.endNavigationSession(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Session has already been ended');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
