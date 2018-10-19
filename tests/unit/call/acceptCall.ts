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
        // Import controller with message spy
        call = proxyquire('../../../controllers/call', {
            './notification/call': {
                sendCallStartedMessage: sendSpy
            }
        });
    });

    it('Accept call when not pending', async () => {
        const req: any = {
            userID: 4,
            call: {
                id: 1,
                sync: 2,
                APId: 3,
                carerId: 4,
                carerIsInitiator: false,
                sessionId: 5,
                state: 'Ongoing'
            }
        };

        // @ts-ignore
        const result = await call.acceptCall(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Can only accept in pending state');
    });

    it('Accept call as initiator', async () => {
        const req: any = {
            userID: 4,
            call: {
                id: 1,
                sync: 2,
                APId: 3,
                carerId: 4,
                carerIsInitiator: true,
                sessionId: 5,
                state: 'Pending'
            }
        };

        // @ts-ignore
        const result = await call.acceptCall(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Initiator cannot accept call');
    });

    it('Reject call as receiver', async () => {
        const saveSpy = sinon.spy();
        const sync = 2;
        const req: any = {
            userID: 3,
            call: {
                id: 1,
                sync,
                APId: 3,
                carerId: 4,
                carerIsInitiator: true,
                sessionId: 5,
                save: saveSpy,
                state: 'Pending'
            }
        };

        // @ts-ignore
        const result = await call.acceptCall(req, res, next);
        expect(result).to.deep.equal({ status: 'success' });

        // Expect call to be saved (to modify state to 'Ongoing')
        expect(saveSpy.calledOnce).to.equal(true);

        // Check send message call
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal(req.call.id);
        expect(sendSpy.lastCall.args[1]).to.equal(sync + 1);
        expect(sendSpy.lastCall.args[2]).to.equal(req.call.sessionId);
        expect(sendSpy.lastCall.args[3]).to.deep.equal([
            req.call.APId,
            req.call.carerId
        ]);
    });
});
