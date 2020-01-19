import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import models from '../../../models';
import { retrieveEmergencyEvent } from '../../../middleware/emergency';

describe('Middleware - Retrieve specified emergency session', () => {
    const sandbox = sinon.createSandbox();

    // Bad emergency ID
    const BAD_ID = 0;

    beforeEach(async () => {
        // Replace findByPk
        sandbox.replace(models.Emergency, 'findByPk', (id: number) => {
            if (id === BAD_ID) {
                // tslint:disable:no-null-keyword / DB will return null here
                return null;
            } else {
                return { id: 1, APId: 1 };
            }
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Retrieve non-existant event', async () => {
        const req: any = {
            userID: 0,
            params: { eventID: BAD_ID }
        };

        // @ts-ignore
        const result = await retrieveEmergencyEvent(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Emergency event does not exist');
    });

    it('Retrieve non-authorised event', async () => {
        const req: any = {
            userID: 2,
            params: { eventID: 1 }
        };

        // Non-existant association between user and AP
        sandbox.replace(models.Association, 'findOne', sinon.fake());

        // @ts-ignore
        const result = await retrieveEmergencyEvent(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Cannot access specified event');
    });

    it('Retrieve event as self', async () => {
        const req: any = {
            userID: 1,
            params: { eventID: 1 }
        };

        // Non-existant association between user and AP
        sandbox.replace(models.Association, 'findOne', sinon.fake());

        // Spy on next call
        const nextSpy = sinon.spy();

        // @ts-ignore
        const result = await retrieveEmergencyEvent(req, res, nextSpy);
        expect(result).to.equal(undefined);
        expect(nextSpy.alwaysCalledWith()).to.equal(true);
    });

    it('Retrieve event as carer', async () => {
        const req: any = {
            userID: 2,
            params: { eventID: 1 }
        };

        // Non-existant association between user and AP
        sandbox.replace(models.Association, 'findOne', sinon.fake());

        // Spy on next call
        const nextSpy = sinon.spy();

        // @ts-ignore
        const result = await retrieveEmergencyEvent(req, res, nextSpy);
        expect(result).to.equal(undefined);
        expect(nextSpy.alwaysCalledWith()).to.equal(true);
    });
});
