import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';
import { Op } from 'sequelize';

import models from '../../../models';
import { getMessages } from '../../../controllers/chat';

describe('Unit - Chat - Get messages', () => {
    const sandbox = sinon.createSandbox();

    before(async () => {
        // Replace find function by getting it to return its argument
        sandbox.replace(models.Message, 'findAll', sinon.stub().returnsArg(0));
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

        // Get and verify the DB query
        // @ts-ignore
        const result = await getMessages(req, res, next);
        const dbQuery = result.messages;
        expect(dbQuery.limit).to.equal(2);
        expect(dbQuery.where.associationId).to.equal(1);
    });

    it('No limit', async () => {
        // Define request with all queries
        const req: any = {
            params: {
                associationID: 1
            },
            query: {}
        };

        // Should default to limit of 10
        // @ts-ignore
        const result = await getMessages(req, res, next);
        const dbQuery = result.messages;
        expect(dbQuery.limit).to.equal(10);
        expect(dbQuery.where.associationId).to.equal(1);
    });

    it('No messages', async () => {
        // Use a fake to return undefined
        sandbox.restore();
        sandbox.replace(models.Message, 'findAll', sinon.fake());

        // Define minimal request
        const req: any = {
            params: {
                associationID: 1
            },
            query: {}
        };

        // Expect an empty array of messages to be returned
        // @ts-ignore
        const result = await getMessages(req, res, next);
        expect(result).to.have.property('messages');
        expect(result.messages).to.have.lengthOf(0);
    });

    after(async () => {
        sandbox.restore();
    });
});
