import { expect } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import models from '../../../models';
import { getMessages } from '../../../controllers/chat';

describe('Chat - Get messages', () => {
    const sandbox = sinon.createSandbox();

    afterEach(async () => {
        sandbox.restore();
    });

    it('All queries', async () => {
        // Define request with all queries
        const req: any = {
            params: {
                associationID: 1
            },
            query: {
                limit: 2,
                before: 4,
                after: 3
            }
        };

        // Spy on find function
        const findSpy = sinon.spy();
        sandbox.replace(models.Message, 'findAll', findSpy);

        // Get and verify the DB query
        // @ts-ignore
        const result = await getMessages(req, res, next);
        expect(findSpy.calledOnce).to.equal(true);
        expect(findSpy.lastCall.args[0].limit).to.equal(req.query.limit);
        expect(findSpy.lastCall.args[0].where.associationId).to.equal(
            req.params.associationID
        );
    });

    it('No limit', async () => {
        // Define request with no limit
        const req: any = {
            params: {
                associationID: 1
            },
            query: {}
        };

        // Spy on find function
        const findSpy = sinon.spy();
        sandbox.replace(models.Message, 'findAll', findSpy);

        // Should default to limit of 10
        // @ts-ignore
        const result = await getMessages(req, res, next);
        expect(findSpy.calledOnce).to.equal(true);
        expect(findSpy.lastCall.args[0].limit).to.equal(10);
        expect(findSpy.lastCall.args[0].where.associationId).to.equal(
            req.params.associationID
        );
    });

    it('No messages', async () => {
        // Define minimal request
        const req: any = {
            params: {
                associationID: 1
            },
            query: {}
        };

        // Use a fake to return undefined
        sandbox.restore();
        sandbox.replace(models.Message, 'findAll', sinon.fake());

        // Expect an empty array of messages to be returned
        // @ts-ignore
        const result = await getMessages(req, res, next);
        expect(result).to.have.property('messages');
        expect(result.messages).to.have.lengthOf(0);
    });
});
