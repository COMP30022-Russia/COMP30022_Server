import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { getNavigationSession } from '../../../controllers/navigation';
import models from '../../../models';

describe('Unit - Navigation - Get navigation session', () => {
    const sandbox = sinon.createSandbox();

    it('Get session', async () => {
        const session = {
            id: 1,
            foo: 'bar'
        };
        const req = {
            params: {
                sessionID: 1
            },
            session: wrapToJSON(session)
        };

        // Expect fake session to be returned
        // @ts-ignore
        const result = await getNavigationSession(req, res, next);
        expect(result).to.deep.equal(session);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
