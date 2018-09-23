import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getSelfNavigationSession } from '../../../controllers/navigation';
import models from '../../../models';

describe('Unit - Navigation - Get self navigation session', () => {
    const sandbox = sinon.createSandbox();

    it('Get session', async () => {
        const req = {
            userID: 1000
        };

        // Return fake session
        const session = {
            id: 1,
            foo: 'bar'
        };
        const dbFake = sinon.fake.returns({ ...session });
        sandbox.replace(models.Session, 'findOne', dbFake);

        // Expect fake session to be returned
        // @ts-ignore
        const result = await getSelfNavigationSession(req, res, next);
        expect(result).to.deep.equal(session);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
