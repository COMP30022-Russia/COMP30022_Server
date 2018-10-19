import { expect } from 'chai';
import sinon from 'sinon';
import { res } from '../index';

import { verifyIDParam } from '../../../middleware/params';

describe('Middleware - Params', () => {
    it('Correct ID', async () => {
        // Request with valid param
        const req = { params: { id: 1 } };

        // Define next
        const next = sinon.spy();

        // Expect next() to be called with no arguments
        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(next.calledWithExactly()).to.equal(true);
    });

    it('Null ID', async () => {
        // Request with invalid param
        const req = { params: {} };

        // Define next to return first argument
        const next = sinon.stub().returnsArg(0);

        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Invalid param id');
    });

    it('Invalid ID', async () => {
        // Define next to return first argument
        const next = sinon.stub();
        next.returnsArg(0);

        // Request with invalid param
        const req = { params: { id: 'a' } };

        // @ts-ignore
        const result = await verifyIDParam('id')(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Invalid param id');
    });
});
