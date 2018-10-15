import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import { getDestinations } from '../../../controllers/destination';
import models from '../../../models';

describe('Unit - Destination - Get destinations', () => {
    const sandbox = sinon.createSandbox();

    it('Get destinations', async () => {
        // Request should have userID
        const req: any = {
            params: {
                userID: 1
            },
            query: {}
        };

        const destination1 = { foo: 'bar' };
        const destination2 = { fizz: 'buzz' };

        // Fake DB call
        const fakeFind = sinon.stub();
        fakeFind
            .onCall(0)
            .returns(
                [destination1, destination2].map((d: any) => wrapToJSON(d))
            );
        fakeFind.onCall(1).returns([wrapToJSON(destination2)]);
        sandbox.replace(models.Destination, 'findAll', fakeFind);

        // @ts-ignore
        const result = await getDestinations(req, res, next);
        expect(result).to.deep.equal({
            recents: [destination1, destination2],
            favourites: [destination2]
        });
    });

    it('Spy limit', async () => {
        // Request should have userID
        const req: any = {
            params: {
                userID: 1
            },
            query: {
                limit: 50
            }
        };

        // Stub DB call to return first argument
        const findSpy = sinon.spy();
        sandbox.replace(models.Destination, 'findAll', findSpy);

        // @ts-ignore
        const result = await getDestinations(req, res, next);
        // Ensure that limit is given to find query
        expect(findSpy.firstCall.args[0].limit).to.equal(req.query.limit);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
