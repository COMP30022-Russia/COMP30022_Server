import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getFirebaseTokens } from '../../../controllers/notification';
import models from '../../../models';

describe('Unit - Notification - Get Firebase token', () => {
    const sandbox = sinon.createSandbox();

    it('Get tokens', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = {
            userID: 1
        };
        const tokens = [{ id: 1, token: 'a' }, { id: 2, token: 'b' }];

        // Fake DB call
        const dbFake = sinon.fake.returns({
            id: 1,
            getFirebaseTokens: () => {
                return tokens;
            }
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: dbFake };
        });

        // @ts-ignore
        const result = await getFirebaseTokens(req, res, next);
        expect(result).to.have.property('tokens');
        expect(result.tokens).to.have.lengthOf(2);
        expect(result.tokens).to.deep.equal([tokens[0].token, tokens[1].token]);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
