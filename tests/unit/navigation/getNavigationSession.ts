import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { getNavigationSession } from '../../../controllers/navigation';
import models from '../../../models';

describe('Unit - Navigation - Get navigation session', () => {
    const sandbox = sinon.createSandbox();

    it('Get session', async () => {
        const req = {
            params: {
                sessionID: 1
            },
            session: {
                id: 1,
                foo: 'bar'
            }
        };

        // Expect fake session to be returned
        // @ts-ignore
        const result = await getNavigationSession(req, res, next);
        expect(result).to.deep.equal(req.session);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
