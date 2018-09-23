import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Chat - Create message', () => {
    const sandbox = sinon.createSandbox();

    // Chat controller
    let chat: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    before(async () => {
        // Import the chat controller with a spy on the notification function
        chat = proxyquire('../../../controllers/chat', {
            './notification/chat': { default: sendSpy }
        });
    });

    it('Create message', async () => {
        // Create message
        const req: any = {
            userID: 2,
            body: {
                content: 'hello'
            },
            params: {
                associationID: 3
            },
            association: { APId: 1, carerId: 2 }
        };
        // ID of created message
        const createdMessageID: number = 1;

        // Replace create function by getting it to return its argument
        // but with an ID field
        sandbox.replace(models.Message, 'create', (input: any) => {
            return Object.assign(input, { id: createdMessageID });
        });

        // Replace findById function also (as it's used to get user name)
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findById: () => {
                    return { id: 2, name: 'Example' };
                }
            };
        });

        // Should get message with ID back
        // @ts-ignore
        const result = await chat.createMessage(req, res, next);
        expect(result.id).to.equal(createdMessageID);
        expect(result.authorId).to.equal(req.userID);
        expect(result.associationId).to.equal(req.params.associationID);

        // Verify the send message call
        // First argument: Name of self
        // Second argument: ID of opposite party
        // Third argument: ID of association
        // Fourth argument: Message content
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(
                'Example',
                req.association.APId,
                req.params.associationID,
                req.body.content
            )
        ).to.equal(true);
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
        const result = await chat.createMessage(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('No message given');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
