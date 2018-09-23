import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import { endNavigationSession } from '../../../controllers/navigation';
import models from '../../../models';

describe('Unit - Navigation - End navigation session', () => {
    const sandbox = sinon.createSandbox();

    // Navigation controller
    let navigation: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    before(async () => {
        // Import the nav controller with a spy on the notification function
        navigation = proxyquire('../../../controllers/navigation', {
            './notification/navigation': { sendNavigationEndMessage: sendSpy }
        });
    });

    it('End session', async () => {
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            }
        };

        // Return fake session
        const spy = sinon.spy();
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            active: true,
            updateAttributes: spy
        };
        const dbFake = sinon.fake.returns({ ...session });
        sandbox.replace(models.Session, 'findOne', dbFake);

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.endNavigationSession(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });
        expect(spy.calledWithExactly({ active: false })).to.equal(true);

        // Verify the send message call
        // First argument: ID of opposite party
        // Second argument: ID of session
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.alwaysCalledWith(session.carerId, session.id)).to.equal(
            true
        );
    });

    it('End ended session', async () => {
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            }
        };

        // Return fake session
        const spy = sinon.spy();
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            active: false
        };
        const dbFake = sinon.fake.returns({ ...session });
        sandbox.replace(models.Session, 'findOne', dbFake);

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
