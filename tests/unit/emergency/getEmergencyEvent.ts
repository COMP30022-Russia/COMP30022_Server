import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { getEmergencyEvent } from '../../../controllers/emergency';

describe('Emergency - Get Emergency event', () => {
    const sandbox = sinon.createSandbox();

    afterEach(async () => {
        sandbox.restore();
    });

    it('Get emergency', async () => {
        const req: any = {
            event: wrapToJSON({
                foo: 'bar'
            })
        };

        // @ts-ignore
        const result = await getEmergencyEvent(req, res, next);
        expect(result).to.deep.equal(req.event.toJSON());
    });
});
