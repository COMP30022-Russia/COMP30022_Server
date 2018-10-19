import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import models from '../../../models';
import { retrieveCall } from '../../../middleware/call';

describe('Middleware - Call', () => {
    const sandbox = sinon.createSandbox();

    const NO_CALL = 0;
    const TERMINATED_CALL = 1;

    before(async () => {
        sandbox.replace(models.Call, 'findOne', (properties: any) => {
            if (properties.where.id === NO_CALL) {
                // tslint:disable:no-null-keyword / DB will return null here
                return null;
            } else if (properties.where.id === TERMINATED_CALL) {
                return { state: 'Terminated' };
            } else {
                return { state: 'Ongoing' };
            }
        });
    });

    after(async () => {
        sandbox.restore();
    });

    it('Bad call - User is not party of call', async () => {
        const req = { userID: 0, params: { callID: NO_CALL } };
        // @ts-ignore
        const result = await retrieveCall()(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('User is not party of call');
    });

    it('Get terminated call', async () => {
        const req = { userID: 1, params: { callID: TERMINATED_CALL } };
        // @ts-ignore
        const result = await retrieveCall()(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Call has already ended');
    });

    it('Get terminated call with allowTerminated == True', async () => {
        const req = { userID: 1, params: { callID: 1 } };
        const nextSpy = sinon.spy();
        // @ts-ignore
        await retrieveCall(true)(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.equal(true);
    });

    it('Get call', async () => {
        const req = { userID: 2, params: { callID: 2 } };
        const nextSpy = sinon.spy();
        // @ts-ignore
        await retrieveCall()(req, res, nextSpy);
        expect(nextSpy.calledOnce).to.equal(true);
    });
});
