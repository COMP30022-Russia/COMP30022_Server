import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Navigation call', () => {
    const sandbox = sinon.createSandbox();
    const sendSpy = sinon.spy();
    let call: any;

    before(async () => {
        call = proxyquire('../../../controllers/call', {
            './notification/call': {
                sendNavigationCallTerminatedMessage: sendSpy
            }
        });
    });

    it('Update failure count < 5', async () => {
        const saveSpy = sinon.spy();
        const req: any = {
            call: {
                id: 1,
                sync: 2,
                APId: 3,
                carerId: 4,
                sessionId: 5,
                failureCount: 3,
                save: saveSpy
            }
        };

        // Should get call
        // @ts-ignore
        const result = await call.updateCallFailureCount(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });

        // Expect call to be saved with updated failure count
        expect(saveSpy.calledOnce).to.equal(true);

        // Call should not be terminated
        expect(sendSpy.calledOnce).to.equal(false);
    });

    it('Update failure count == 5', async () => {
        const saveSpy = sinon.spy();
        const req: any = {
            call: {
                id: 1,
                sync: 2,
                APId: 3,
                carerId: 4,
                sessionId: 5,
                failureCount: 4,
                save: saveSpy
            }
        };

        // @ts-ignore
        const result = await call.updateCallFailureCount(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });

        // Expect call to be saved (to modify state to 'Terminated')
        expect(saveSpy.calledOnce).to.equal(true);

        // Check terminate call
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(5);
        expect(sendSpy.lastCall.args[0]).to.equal(req.call.id);
        expect(sendSpy.lastCall.args[1]).to.equal(req.call.sync);
        expect(sendSpy.lastCall.args[2]).to.equal(req.call.sessionId);
        expect(sendSpy.lastCall.args[3]).to.equal('failure_count_exceeded');
        expect(sendSpy.lastCall.args[4]).to.deep.equal([
            req.call.APId,
            req.call.carerId
        ]);
    });
});
