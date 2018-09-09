import { expect, request } from 'chai';
import rewire from 'rewire';

describe('Unit - Models - User', () => {
    // Bring module in with rewire
    const userModel = rewire('../../../models/user');
    const hashPassword = userModel.__get__('hashPassword');

    it('Hash Password', async () => {
        const r = await hashPassword('foo');
        expect(r).to.be.a('string');
    });
});
