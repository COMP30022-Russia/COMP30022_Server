import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { getSelfDetails } from '../../../controllers/user';
import models from '../../../models';

describe('User Details', () => {
    const sandbox = sinon.createSandbox();

    afterEach(async () => {
        sandbox.restore();
    });

    it('Get Self Details', async () => {
        // Params should have userID
        const req: any = { userID: 1 };
        const user: any = { id: req.userID };

        // Replace database query
        sandbox.replace(
            models.User,
            'findById',
            sinon.fake.returns(wrapToJSON(user))
        );

        // @ts-ignore
        const result = await getSelfDetails(req, res, next);
        expect(result).to.deep.equal(user);
    });
});
