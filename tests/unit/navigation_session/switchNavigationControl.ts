import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

describe('Navigation', () => {
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

    afterEach(async () => {
        sandbox.restore();
    });

    it('Switch control', async () => {
        const sync = 1;
        const saveSpy = sinon.spy();
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: {
                id: 1,
                APId: 2,
                carerId: 3,
                carerHasControl: true,
                save: saveSpy,
                sync,
                toJSON: () => req.session
            }
        };

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.switchNavigationControl(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('carerId');
        expect(result).to.have.property('carerHasControl');
        expect(result.id).to.equal(req.session.id);
        expect(result.APId).to.equal(req.session.APId);
        expect(result.carerId).to.equal(req.session.carerId);
        expect(result.carerHasControl).to.equal(false);
        expect(saveSpy.calledWithExactly()).to.equal(true);

        // Verify the send message call
        // First argument: ID of opposite party
        // Second argument: ID of session
        // Third argument: carerHasControl
        // Fourth argument: sync
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal(req.session.carerId);
        expect(sendSpy.lastCall.args[1]).to.equal(req.session.id);
        expect(sendSpy.lastCall.args[2]).to.equal(false);
        expect(sendSpy.lastCall.args[3]).to.equal(sync + 1);
    });
});
