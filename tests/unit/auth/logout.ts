import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import models from '../../../models';
import { logout } from '../../../controllers/auth';

describe('User - Logout', () => {
    const sandbox = sinon.createSandbox();

    // Spy for remove function
    const removeSpy = sinon.spy();

    before(async () => {
        // Put spy on remove function
        sandbox.replace(models.FirebaseToken, 'destroy', removeSpy);
    });

    after(async () => {
        sandbox.restore();
    });

    it('Logout', async () => {
        const req: any = {
            userID: 1,
            body: {
                instanceID: 'dummy_instance_id'
            }
        };

        // @ts-ignore
        const result = await logout(req, res, next);
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        // Check remove
        expect(removeSpy.calledOnce).to.equal(true);
        expect(removeSpy.lastCall.args).to.have.lengthOf(1);
        expect(removeSpy.lastCall.args[0]).to.deep.equal({
            where: { instanceID: req.body.instanceID, userId: req.userID }
        });
    });

    it('Logout without instanceID', async () => {
        const req: any = {
            userID: 1,
            body: {}
        };

        // @ts-ignore
        const result = await logout(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Instance ID not given');
    });
});
