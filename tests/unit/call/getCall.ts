import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import models from '../../../models';
import { getCall } from '../../../controllers/call';

describe('Unit - Navigation call', () => {
    const sandbox = sinon.createSandbox();

    it('Get call', async () => {
        const req: any = {
            call: { foo: 'bar' }
        };

        // Should get call
        // @ts-ignore
        const result = await getCall(req, res, next);
        expect(result).to.deep.equal(req.call);
    });
});
