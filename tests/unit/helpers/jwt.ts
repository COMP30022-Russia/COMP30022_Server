import { expect, request } from 'chai';
import { jwt_sign, jwt_verify } from '../../../helpers/jwt';

describe('Unit - Helpers - JWT', () => {
    it('Sign', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = await jwt_sign(payload);
        expect(signed).to.be.a('string');

        // Sign timed token
        const signed_timed = await jwt_sign(payload, '1m');
        expect(signed).to.be.a('string');
    });

    it('Verify/Decode', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = await jwt_sign(payload);

        const decoded = await jwt_verify(signed);
        expect(decoded).to.have.property('foo');
        expect(decoded.foo).to.equal('bar');
    });

    it('Verify/Decode expired', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = await jwt_sign(payload, '-1s');

        // Try to decode expired token
        const decoded = jwt_verify(signed);
        expect(decoded).to.be.rejectedWith(Error);
    });

    it('Verify/Decode invalid', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = (await jwt_sign(payload)) + 'a';

        // Try to decode expired token
        const decoded = jwt_verify(signed);
        expect(decoded).to.be.rejectedWith(Error);
    });
});
