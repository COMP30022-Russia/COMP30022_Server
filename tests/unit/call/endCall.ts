import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

describe('Navigation call', () => {
    // Call controller
    let call: any;

    // Spy on message sending
    const sendSpy = sinon.spy();

    before(async () => {
        call = proxyquire('../../../controllers/call', {
            './notification/call': {
                sendNavigationCallTerminatedMessage: sendSpy
            }
        });
    });

    it('End call', async () => {
        const saveSpy = sinon.spy();
        const req: any = {
            call: {
                id: 1,
                sync: 2,
                APId: 3,
                carerId: 4,
                saveSpy,
                sessionId: 5,
                save: saveSpy
            }
        };

        // Should get call
        // @ts-ignore
        const result = await call.endCall(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });

        // Expect call to be saved (to modify state to 'Terminated')
        expect(saveSpy.calledOnce).to.equal(true);

        // Check send message call
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(5);
        expect(sendSpy.lastCall.args[0]).to.equal(req.call.id);
        expect(sendSpy.lastCall.args[1]).to.equal(req.call.sync);
        expect(sendSpy.lastCall.args[2]).to.equal(req.call.sessionId);
        expect(sendSpy.lastCall.args[3]).to.equal('normal');
        expect(sendSpy.lastCall.args[4]).to.deep.equal([
            req.call.APId,
            req.call.carerId
        ]);
    });
});
