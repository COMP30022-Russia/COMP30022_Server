import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';

describe('User - Login', () => {
    const sandbox = sinon.createSandbox();

    // User controller
    let user: any;

    // Fake signed token value
    const FAKE_TOKEN_VALUE = '1234';

    before(async () => {
        // Stub JWT sign function to return '1234'
        const jwtSignStub = sandbox.stub().returns(FAKE_TOKEN_VALUE);
        // Import the user controllers with the jwtSign function stubbed
        user = proxyquire('../../../controllers/auth', {
            '../helpers/jwt': { jwtSign: jwtSignStub }
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Successful', async () => {
        const req: any = {
            body: {
                username: 'p1',
                password: 'p1'
            }
        };

        // Fake DB call to return user object with verifyPassword function
        const dbReturnValue = { id: 1 };
        const dbFake = sinon.fake.returns({
            // Define password verification stub
            verifyPassword: sinon.stub().returns(true),
            // Wrap return value
            ...wrapToJSON(dbReturnValue)
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findOne: dbFake };
        });

        // @ts-ignore
        const result = await user.login(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('token');
        expect(result.id).to.equal(dbReturnValue.id);
        expect(result.token).to.equal(FAKE_TOKEN_VALUE);
    });

    it('Incorrect username', async () => {
        const req: any = {
            body: {
                username: 'p1',
                password: 'p1'
            }
        };

        // Fake DB call to return null user object
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findOne: sinon.fake.returns(undefined) };
        });

        // @ts-ignore
        const result = await user.login(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.be.equal('Username/password incorrect');
    });

    it('Incorrect password', async () => {
        const req: any = {
            body: {
                username: 'p1',
                password: 'p1'
            }
        };

        // Fake DB call to return user object with verifyPassword function
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                // Return a verifyPassword function which always returns false
                findOne: () => {
                    return { verifyPassword: sinon.stub().returns(false) };
                }
            };
        });

        // @ts-ignore
        const result = await user.login(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.be.equal('Username/password incorrect');
    });
});
