import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import proxyquire from 'proxyquire';

import models from '../../../models';

describe('Unit - Association - Get association token', () => {
    const sandbox = sinon.createSandbox();
    let association: any;

    before(async () => {
        // Stub JWT sign function to return '1234'
        const JWTSignStub = sandbox.stub().returns('1234');
        // Import the association controllers with the jwt_sign function stubbed
        association = proxyquire('../../../controllers/association', {
            '../helpers/jwt': { jwt_sign: JWTSignStub }
        });
    });

    it('Retrieve', async () => {
        // Request should have userID (user should be authenticated)
        const req: any = {
            userID: 1
        };

        // @ts-ignore
        const result = await association.getAssociationToken(req, res, next);
        expect(result).to.deep.equal({ token: '1234' });
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
