import { expect, request } from 'chai';
import sinon from 'sinon';
import { res } from '../index';

import { verifyIDParam } from '../../../middleware/params';

describe('Unit - Middleware - Params', () => {
    it('Correct', async () => {
        // Define next
        const next = sinon.spy();

        // Request with valid param
        const req = {
            params: {
                id: 1
            }
        };

        // Expect next() to be called with no arguments
        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(next.calledWithExactly()).to.equal(true);
    });

    it('Null', async () => {
        // Define next to return first argument
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
        // Define next to return first argument
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
