import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getEmergencyEvent } from '../../../controllers/emergency';
import models from '../../../models';

describe('Unit - Emergency - Get Emergency event', () => {
    const sandbox = sinon.createSandbox();

    it('Get emergency', async () => {
        // Request should have userID
        const req: any = {
            event: {
                foo: 'bar'
            }
        };

        // @ts-ignore
        const result = await getEmergencyEvent(req, res, next);
        expect(result).to.deep.equal(req.event);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
