import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

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

        // Fake DB call
        const fakeFind = sinon.stub();
        fakeFind.onCall(0).returns([1, 1]);
        fakeFind.onCall(1).returns([2]);
        sandbox.replace(models.Destination, 'findAll', fakeFind);

        // @ts-ignore
        const result = await getDestinations(req, res, next);
        expect(result).to.deep.equal({
            recents: [1, 1],
            favourites: [2]
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
        const stubFind = sinon.stub().returnsArg(0);
        sandbox.replace(models.Destination, 'findAll', stubFind);

        // @ts-ignore
        const result = await getDestinations(req, res, next);
        expect(result).to.have.property('recents');
        expect(result.recents).to.have.property('limit');
        expect(result.recents.limit).to.equal(req.query.limit);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
