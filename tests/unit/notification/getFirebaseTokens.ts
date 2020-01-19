import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getFirebaseTokens } from '../../../controllers/notification';
import models from '../../../models';

describe('Notification - Get Firebase token', () => {
    const sandbox = sinon.createSandbox();

    after(async () => {
        sandbox.restore();
    });

    it('Get tokens', async () => {
        const req: any = { userID: 1 };

        // Fake DB call
        const tokens = [
            { id: 1, token: 'a' },
            { id: 2, token: 'b' }
        ];
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findByPk: sinon.fake.returns({
                    id: 1,
                    getFirebaseTokens: () => tokens
                })
            };
        });

        // @ts-ignore
        const result = await getFirebaseTokens(req, res, next);
        expect(result).to.have.property('tokens');
        expect(result.tokens).to.have.lengthOf(2);
        expect(result.tokens).to.deep.equal([tokens[0].token, tokens[1].token]);
    });
});
