import { expect } from 'chai';
import { jwtSign, jwtVerify } from '../../../helpers/jwt';

describe('Helpers - JWT', () => {
    it('Sign', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = await jwtSign(payload);
        expect(signed).to.be.a('string');

        // Sign timed token
        const signedTimed = await jwtSign(payload, '1m');
        expect(signedTimed).to.be.a('string');
    });

    it('Verify/Decode', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign and decode
        const signed = await jwtSign(payload);
        const decoded = await jwtVerify(signed);
        expect(decoded).to.have.property('foo');
        expect(decoded.foo).to.equal('bar');
    });

    it('Verify/Decode expired', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = await jwtSign(payload, '-1s');
        // Try to decode expired token
        const decoded = jwtVerify(signed);
        expect(decoded).to.be.rejectedWith(Error);
    });

    it('Verify/Decode invalid', async () => {
        const payload = {
            foo: 'bar'
        };

        // Sign
        const signed = `${await jwtSign(payload)}a`;
        // Try to decode invalid token
        const decoded = jwtVerify(signed);
        expect(decoded).to.be.rejectedWith(Error);
    });
});
