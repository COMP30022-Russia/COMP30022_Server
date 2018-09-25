import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Navigation', () => {
    const sandbox = sinon.createSandbox();

    // Navigation session controller
    let navigation: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    before(async () => {
        // Import the nav controller with a spy on the notification function
        navigation = proxyquire('../../../controllers/navigation_session', {
            './notification/navigation': {
                sendNavigationControlSwitchedMessage: sendSpy
            }
        });
    });

    it('Switch control', async () => {
        const saveSpy = sinon.spy();
        // 'id', 'carerHasControl', 'APId', 'carerId'
        const session = {
            id: 1,
            APId: 2,
            carerId: 3,
            carerHasControl: true,
            save: saveSpy
        };
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: { ...session }
        };

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.switchNavigationControl(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('carerId');
        expect(result).to.have.property('carerHasControl');
        expect(result.id).to.equal(session.id);
        expect(result.APId).to.equal(session.APId);
        expect(result.carerId).to.equal(session.carerId);
        expect(result.carerHasControl).to.equal(!session.carerHasControl);
        expect(saveSpy.calledWithExactly()).to.equal(true);

        // Verify the send message call
        // First argument: ID of opposite party
        // Second argument: ID of session
        // Third argument: carerHasControl
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(
                session.carerId,
                session.id,
                !session.carerHasControl
            )
        ).to.equal(true);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
