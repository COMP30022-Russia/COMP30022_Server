import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';
import proxyquire from 'proxyquire';

import models from '../../../models';

describe('Emergency - Initiate emergency event', () => {
    const sandbox = sinon.createSandbox();

    // Emergency controller
    let emergency: any;

    // Message sending spy
    const messageSpy = sinon.spy();

    const NO_CALL_AP = 1;
    const CARER_INITIATOR = 0;

    before(async () => {
        // Import controller with spy on message sending
        emergency = proxyquire('../../../controllers/emergency', {
            './notification/emergency': { sendEmergencyMessage: messageSpy }
        });
    });

    beforeEach(async () => {
        // Replace get user call
        sandbox.replace(models.User, 'findOne', (properties: any) => {
            if (properties.where.id === CARER_INITIATOR) {
                return { type: 'carer', name: 'xyz', mobileNumber: 'foo' };
            } else {
                return { type: 'AP', name: 'zyx', mobileNumber: 'bar' };
            }
        });

        // Replace find association call
        sandbox.replace(models.Association, 'findAll', (_: any) => {
            return [{ carerId: 5 }, { carerId: 4 }];
        });

        // Replace find emergency call
        sandbox.replace(models.Emergency, 'findOne', (properties: any) => {
            if (properties.where.APId === NO_CALL_AP) {
                // tslint:disable:no-null-keyword / DB will return null here
                return null;
            } else {
                return wrapToJSON({ id: 5, APId: 10, handled: false });
            }
        });

        // Replace create call
        sandbox.replace(models.Emergency, 'create', (properties: any) => {
            return wrapToJSON({
                id: 10,
                APId: properties.APId,
                handled: false
            });
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Try to initiate as carer', async () => {
        const req: any = {
            userID: CARER_INITIATOR
        };

        // @ts-ignore
        const result = await emergency.inititateEmergencyEvent(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Only APs can start emergency events');
    });

    it('Create new event', async () => {
        const req: any = {
            userID: NO_CALL_AP
        };

        // @ts-ignore
        const result = await emergency.inititateEmergencyEvent(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('handled');
        expect(result.id).to.equal(10);
        expect(result.APId).to.equal(1);
        expect(result.handled).to.equal(false);

        // Check send message call
        expect(messageSpy.calledOnce).to.equal(true);
        expect(messageSpy.lastCall.args).to.have.lengthOf(5);
        expect(messageSpy.lastCall.args[0]).to.equal(10);
        expect(messageSpy.lastCall.args[1]).to.equal(req.userID);
        expect(messageSpy.lastCall.args[2]).to.equal('zyx');
        expect(messageSpy.lastCall.args[3]).to.equal('bar');
        expect(messageSpy.lastCall.args[4]).to.deep.equal([5, 4]);
    });

    it("Initiate when there's ongoing event", async () => {
        const req: any = {
            userID: 2
        };

        // @ts-ignore
        const result = await emergency.inititateEmergencyEvent(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('handled');
        expect(result.id).to.equal(5);
        expect(result.APId).to.equal(10);
        expect(result.handled).to.equal(false);

        // Check send message call
        expect(messageSpy.calledOnce).to.equal(false);
        expect(messageSpy.lastCall.args).to.have.lengthOf(5);
        expect(messageSpy.lastCall.args[0]).to.equal(5);
        expect(messageSpy.lastCall.args[1]).to.equal(req.userID);
        expect(messageSpy.lastCall.args[2]).to.equal('zyx');
        expect(messageSpy.lastCall.args[3]).to.equal('bar');
        expect(messageSpy.lastCall.args[4]).to.deep.equal([5, 4]);
    });
});
