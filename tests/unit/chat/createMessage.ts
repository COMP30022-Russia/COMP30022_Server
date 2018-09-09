import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import models from '../../../models';
import { createMessage } from '../../../controllers/chat';

describe('Unit - Chat - Create message', () => {
    const sandbox = sinon.createSandbox();

    it('Create message', async () => {
        // Create message
        const req: any = {
            userID: 2,
            body: {
                content: 'hello'
            },
            params: {
                associationID: 3
            }
        };

        // Replace create function by getting it to return its argument
        // but with an ID field
        sandbox.replace(models.Message, 'create', (input: any) => {
            return Object.assign(input, { id: 1 });
        });

        // Should get message with ID back
        // @ts-ignore
        const result = await createMessage(req, res, next);
        expect(result.id).to.equal(1);
        expect(result.authorId).to.equal(2);
        expect(result.associationId).to.equal(3);
    });

    it('Create message without message', async () => {
        // Create message
        const req: any = {
            userID: {
                id: 2
            },
            body: {
                content: ''
            },
            params: {
                associationID: 3
            }
        };

        // Should get validation error
        // @ts-ignore
        const result = await createMessage(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('No message given');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
