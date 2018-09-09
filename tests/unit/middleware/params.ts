import { expect, request } from 'chai';
import sinon from 'sinon';
import { res } from '../index';

import { verifyIDParam } from '../../../middleware/params';

describe('Unit - Middleware - Params', () => {
    it('Correct', async () => {
        // Define next
        const next = sinon.stub();
        next.returns(0);

        // Request with valid param
        const req = {
            params: {
                id: 1
            }
        };

        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(result).to.equal(0);
    });

    it('Null', async () => {
        // Define next
        const next = sinon.stub();
        next.returnsArg(0);

        // Request with invalid param
        const req = {
            params: {}
        };

        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Invalid param id');
    });

    it('Invalid', async () => {
        // Define next
        const next = sinon.stub();
        next.returnsArg(0);

        // Request with invalid param
        const req = {
            params: {
                id: 'a'
            }
        };

        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Invalid param id');
    });
});
