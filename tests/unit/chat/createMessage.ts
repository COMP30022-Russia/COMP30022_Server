import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';

describe('Chat - Create message', () => {
    const sandbox = sinon.createSandbox();

    // Chat controller
    let chat: any;

    // ID of created message
    const createdMessageID = 1;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    before(async () => {
        // Import the chat controller with a spy on the notification function
        chat = proxyquire('../../../controllers/chat', {
            './notification/chat': { sendChatMessage: sendSpy }
        });

        // Replace create function by getting it to return its argument
        // but with an ID field
        sandbox.replace(models.Message, 'create', (input: any) => {
            return wrapToJSON({ ...input, id: createdMessageID });
        });

        // Replace findById function also (as it's used to get user name)
        sandbox.replace(models.User, 'scope', (scopeName: string) => {
            return {
                findById: () => {
                    return { id: 2, name: 'Example' };
                }
            };
        });
    });

    after(async () => {
        sandbox.restore();
    });

    it('Create message', async () => {
        // Create message
        const partnerID = 5;
        const req: any = {
            userID: 2,
            body: {
                content: 'hello'
            },
            params: {
                associationID: 3
            },
            association: { getPartnerID: (_: number) => partnerID }
        };

        // Should get message with ID back
        // @ts-ignore
        const result = await chat.createMessage(req, res, next);
        expect(result.id).to.equal(createdMessageID);
        expect(result.authorId).to.equal(req.userID);
        expect(result.associationId).to.equal(req.params.associationID);

        // Verify the send message call
        // First argument: Name of sender
        // Second argument: ID of opposite party
        // Third argument: ID of association
        // Fourth argument: Message content
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal('Example');
        expect(sendSpy.lastCall.args[1]).to.equal(partnerID);
        expect(sendSpy.lastCall.args[2]).to.equal(req.params.associationID);
        expect(sendSpy.lastCall.args[3]).to.equal(req.body.content);
    });

    it('Create message without message', async () => {
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

        // @ts-ignore
        const result = await chat.createMessage(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('No message given');
    });
});
