import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getSelfDetails } from '../../../controllers/user';
import models from '../../../models';

describe('Unit - User Details', () => {
    const sandbox = sinon.createSandbox();

    it('Get Self Details', async () => {
        // Params should have userID
        const req: any = { userID: 1 };
        const user: any = { id: req.userID };

        // Replace database query
        sandbox.replace(
            models.User,
            'findById',
            sinon.fake.returns({ ...user, toJSON: () => user })
        );

        // @ts-ignore
        const result = await getSelfDetails(req, res, next);
        expect(result).to.have.property('id');
        expect(result.id).to.equal(req.userID);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
