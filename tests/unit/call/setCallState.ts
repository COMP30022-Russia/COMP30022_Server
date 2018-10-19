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
        // Spy on message sending
        call = proxyquire('../../../controllers/call', {
            './notification/call': {
                sendNavigationCallStateChangeMessage: sendSpy
            }
        });
    });

    it('Invalid set call state', async () => {
        const req: any = {
            call: {},
            body: { state: 'Terminate' }
        };

        // @ts-ignore
        const result = await call.setCallState(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Invalid state change');
    });

    it('Set invalid state 2', async () => {
        const req: any = {
            call: {
                id: 1,
                sync: 2,
                APId: 3,
                carerId: 4,
                sessionId: 5,
                failureCount: 4,
                updateAttributes: sinon.stub().throws('Bad')
            },
            body: { state: 'Bad' }
        };

        // @ts-ignore
        const result = await call.setCallState(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Invalid state change');
    });

    it('Set state', async () => {
        const saveSpy = sinon.spy();
        const sync = 2;
        const req: any = {
            call: {
                id: 1,
                sync,
                APId: 3,
                carerId: 4,
                sessionId: 5,
                failureCount: 4,
                save: saveSpy,
                state: 'OngoingCamera',
                toJSON: () => req.call
            },
            body: { state: 'Ongoing' }
        };

        // @ts-ignore
        const result = await call.setCallState(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('sync');
        expect(result).to.have.property('state');
        expect(result).to.have.property('failureCount');
        expect(result.id).to.equal(req.call.id);
        expect(result.sync).to.equal(sync + 1);
        expect(result.state).to.equal(req.body.state);
        expect(result.failureCount).to.equal(0);

        // Ensure that save is called
        expect(saveSpy.calledOnce).to.equal(true);

        // Check send message
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(5);
        expect(sendSpy.lastCall.args[0]).to.equal(req.call.id);
        expect(sendSpy.lastCall.args[1]).to.equal(sync + 1);
        expect(sendSpy.lastCall.args[2]).to.equal(req.call.sessionId);
        expect(sendSpy.lastCall.args[3]).to.equal(req.body.state);
        expect(sendSpy.lastCall.args[4]).to.deep.equal([
            req.call.APId,
            req.call.carerId
        ]);
    });
});
