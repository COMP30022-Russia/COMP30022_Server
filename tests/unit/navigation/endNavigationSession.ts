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

    // Spy for call termination
    const terminateSpy = sinon.spy();

    before(async () => {
        // Import the nav controller with spies
        navigation = proxyquire('../../../controllers/navigation', {
            './notification/navigation': { sendNavigationEndMessage: sendSpy },
            './navigation_session': {
                locationCache: { deleteItem: deleteSpy }
            },
            './call': { terminateCall: terminateSpy }
        });
    });

    it('End session', async () => {
        const updateSpy = sinon.spy();
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            active: true,
            updateAttributes: updateSpy,
            getCall: (): any => {
                return undefined;
            }
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

    it('End session with call', async () => {
        const updateSpy = sinon.spy();
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            active: true,
            updateAttributes: sinon.fake(),
            getCall: () => {
                return { state: 'Ongoing' };
            }
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

        // Check that call termination is called
        expect(terminateSpy.calledOnce).to.equal(true);
        expect(terminateSpy.lastCall.args).to.have.lengthOf(2);
        expect(terminateSpy.lastCall.args[0]).to.deep.equal({
            state: 'Ongoing'
        });
        expect(terminateSpy.lastCall.args[1]).to.equal('nav_session_end');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
