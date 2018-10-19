import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import proxyquire from 'proxyquire';

describe('Association - Get association token', () => {
    const sandbox = sinon.createSandbox();

    // Association controller
    let association: any;

    // Fake token value
    const FAKE_TOKEN_VALUE = '1234';

    before(async () => {
        // Stub JWT sign function to return '1234'
        const jwtSignStub = sandbox.stub().returns(FAKE_TOKEN_VALUE);
        // Import the association controllers with the jwtSign function stubbed
        association = proxyquire('../../../controllers/association', {
            '../helpers/jwt': { jwtSign: jwtSignStub }
        });
    });

    after(async () => {
        sandbox.restore();
    });

    it('Retrieve', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = { userID: 1 };

        // Expect a token to be returned
        // @ts-ignore
        const result = await association.getAssociationToken(req, res, next);
        expect(result).to.deep.equal({ token: FAKE_TOKEN_VALUE });
    });
});
