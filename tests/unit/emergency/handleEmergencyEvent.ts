import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import proxyquire from 'proxyquire';

import models from '../../../models';

describe('Emergency - Handle emergency event', () => {
    const sandbox = sinon.createSandbox();

    // Emergency controller
    let emergency: any;

    // Spy on message sending
    const messageSpy = sinon.spy();

    before(async () => {
        // Import emergency controller with message sending spy
        emergency = proxyquire('../../../controllers/emergency', {
            './notification/emergency': {
                sendEmergencyHandledMessage: messageSpy
            }
        });

        // Replace find association call
        sandbox.replace(models.Association, 'findAll', (_: any) => {
            return [{ carerId: 5 }, { carerId: 4 }];
        });
    });

    after(async () => {
        sandbox.restore();
    });

    it('Try to handle handled event', async () => {
        const req: any = {
            userID: 0,
            event: { handled: true },
            params: {}
        };

        // @ts-ignore
        const result = await emergency.handleEmergencyEvent(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Emergency event has already been handled'
        );
    });

    it('Handle event', async () => {
        const saveSpy = sinon.spy();
        const req: any = {
            userID: 0,
            event: {
                save: saveSpy,
                handled: false,
                id: 1,
                toJSON: () => req.event
            },
            params: {}
        };

        // @ts-ignore
        const result = await emergency.handleEmergencyEvent(req, res, next);
        expect(result.id).to.equal(req.event.id);
        expect(result.resolverId).to.equal(req.userID);
        expect(result.handled).to.equal(true);

        // Expect save to be called once
        expect(saveSpy.calledOnce).to.equal(true);

        // Check sent notification
        expect(messageSpy.calledOnce).to.equal(true);
        expect(messageSpy.lastCall.args).to.have.lengthOf(2);
        expect(messageSpy.lastCall.args[0]).to.equal(req.event.id);
        expect(messageSpy.lastCall.args[1]).to.deep.equal([5, 4]);
    });
});
