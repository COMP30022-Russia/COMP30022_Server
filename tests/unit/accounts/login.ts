import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import proxyquire from 'proxyquire';
import models from '../../../models';

describe('Unit - User - Login', () => {
    const sandbox = sinon.createSandbox();
    let user: any;

    before(async () => {
        // Stub JWT sign function to return '1234'
        const JWTSignStub = sandbox.stub().returns('1234');
        // Import the user controllers with the jwt_sign function stubbed
        user = proxyquire('../../../controllers/user', {
            '../helpers/jwt': { jwt_sign: JWTSignStub }
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Successful', async () => {
        const dbReturnValue = { id: 1 };

        // Fake DB call to return user object with verifyPassword function
        const dbFake = sinon.fake.returns({
            // Define password verification stub
            verifyPassword: sinon.stub().returns(true),
            // Define toJSON function
            toJSON: () => {
                return dbReturnValue;
            }
        });
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { find: dbFake };
        });

        const req: any = {
            body: {
                username: 'p1',
                password: 'p1'
            }
        };

        // @ts-ignore
        const result = await user.login(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('token');
        expect(result.id).to.equal(1);
        expect(result.token).to.equal('1234');
    });

    it('Incorrect username', async () => {
        // Fake DB call to return null user object
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { find: sinon.fake.returns(undefined) };
        });

        const req: any = {
            body: {
                username: 'p1',
                password: 'p1'
            }
        };

        // @ts-ignore
        const result = await user.login(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.be.equal('Username/password incorrect');
    });

    it('Incorrect password', async () => {
        // Fake DB call to return user object with verifyPassword function
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                // Return a verifyPassword function which always returns false
                find: () => {
                    return { verifyPassword: sinon.stub().returns(false) };
                }
            };
        });

        const req: any = {
            body: {
                username: 'p1',
                password: 'p1'
            }
        };

        // @ts-ignore
        const result = await user.login(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.be.equal('Username/password incorrect');
    });
});
