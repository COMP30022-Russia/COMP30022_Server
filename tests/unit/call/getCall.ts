import { expect } from 'chai';
import { res, next } from '../index';

import { getCall } from '../../../controllers/call';

describe('Navigation call', () => {
    it('Get call', async () => {
        const req: any = {
            call: { foo: 'bar' }
        };
        // @ts-ignore
        const result = await getCall(req, res, next);
        expect(result).to.deep.equal(req.call);
    });
});
