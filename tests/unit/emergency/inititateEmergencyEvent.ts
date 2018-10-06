import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import proxyquire from 'proxyquire';

import models from '../../../models';

describe('Unit - Emergency - Initiate emergency event', () => {
    const sandbox = sinon.createSandbox();
    let emergency: any;
    const messageSpy = sinon.spy();

    before(async () => {
        emergency = proxyquire('../../../controllers/emergency', {
            './notification/emergency': { sendEmergencyMessage: messageSpy }
        });
    });

    const event = beforeEach(async () => {
        // Replace get user call
        sandbox.replace(models.User, 'findOne', (properties: any) => {
            if (properties.where.id === 0) {
                return { type: 'carer', name: 'xyz' };
            } else {
                return { type: 'AP', name: 'zyx' };
            }
        });

        // Replace find association call
        sandbox.replace(models.Association, 'findAll', (_: any) => {
            return [{ carerId: 5 }, { carerId: 4 }];
        });

        // Replace find emergency call
        sandbox.replace(models.Emergency, 'findOne', (properties: any) => {
            if (properties.where.APId == 1) {
                // tslint:disable:no-null-keyword / DB will return null here
                return null;
            } else {
                return { id: 5, APId: 10, handled: false };
            }
        });

        // Replace create call
        sandbox.replace(models.Emergency, 'create', (properties: any) => {
            return { id: 10, APId: properties.APId, handled: false };
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Try to initiate as carer', async () => {
        // Request should have userID
        const req: any = {
            userID: 0
        };

        // @ts-ignore
        const result = await emergency.inititateEmergencyEvent(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Only APs can start emergency events');
    });

    it('Create new event', async () => {
        // Request should have userID
        const req: any = {
            userID: 1
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
        expect(messageSpy.lastCall.args).to.have.lengthOf(4);
        expect(messageSpy.lastCall.args[0]).to.equal(10);
        expect(messageSpy.lastCall.args[1]).to.equal(req.userID);
        expect(messageSpy.lastCall.args[2]).to.equal('zyx');
        expect(messageSpy.lastCall.args[3]).to.deep.equal([5, 4]);
    });

    it("Initiate when there's ongoing event", async () => {
        // Request should have userID
        const req: any = {
            userID: 1
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
        expect(messageSpy.calledOnce).to.equal(false);
        expect(messageSpy.lastCall.args).to.have.lengthOf(4);
        expect(messageSpy.lastCall.args[0]).to.equal(10);
        expect(messageSpy.lastCall.args[1]).to.equal(req.userID);
        expect(messageSpy.lastCall.args[2]).to.equal('zyx');
        expect(messageSpy.lastCall.args[3]).to.deep.equal([5, 4]);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
