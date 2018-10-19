import { expect } from 'chai';
import rewire from 'rewire';

describe('Models - User', () => {
    // Bring module in with rewire
    const userModel = rewire('../../../models/user');
    const hashPassword = userModel.__get__('hashPassword');

    it('Hash Password', async () => {
        const result = await hashPassword('foo');
        expect(result).to.be.a('string');
    });
});
