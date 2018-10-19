import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { res, next } from '../index';

import { updateFirebaseToken } from '../../../controllers/notification';
import models from '../../../models';

describe('Notification - Update Firebase token', () => {
    const sandbox = sinon.createSandbox();

    // Declare spies
    let addTokenSpy: SinonSpy;
    const destroyCallSpy: SinonSpy = sinon.spy();

    before(async () => {
        // Fake get user call
        const fakeUser = {
            id: 1,
            // Fake addFirebaseToken call of user
            // tslint:disable:no-empty
            addFirebaseToken: () => {}
        };
        addTokenSpy = sinon.spy(fakeUser, 'addFirebaseToken');

        // Fake get user call
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return { findById: sinon.fake.returns(fakeUser) };
        });

        // Fake token create call
        sandbox.replace(
            models.FirebaseToken,
            'create',
            sinon.stub().returnsArg(0)
        );

        // Fake destroy call
        sandbox.replace(models.FirebaseToken, 'destroy', destroyCallSpy);
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Update token', async () => {
        const req: any = {
            userID: 1,
            body: {
                instanceID: 'foo',
                token: 'bar'
            }
        };

        // Expect { status: 'success' } to be returned
        // @ts-ignore
        const result = await updateFirebaseToken(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        // Expect destroy call to be called once
        expect(destroyCallSpy.callCount).to.equal(1);
        expect(destroyCallSpy.getCall(0).args).to.have.lengthOf(1);
        expect(destroyCallSpy.getCall(0).args[0]).to.deep.equal({
            where: { instanceID: req.body.instanceID, userId: req.userID }
        });

        // Expect add token call to be called once
        expect(addTokenSpy.callCount).to.equal(1);
        expect(addTokenSpy.getCall(0).args).to.have.lengthOf(1);
        expect(addTokenSpy.getCall(0).args[0]).to.deep.equal({
            token: req.body.token,
            instanceID: req.body.instanceID
        });
    });
});
