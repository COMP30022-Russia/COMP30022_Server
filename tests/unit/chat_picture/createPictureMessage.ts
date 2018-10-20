import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import { res, next, wrapToJSON } from '../index';
import models from '../../../models';

describe('Chat - Create Picture message', () => {
    const sandbox = sinon.createSandbox();

    // Spy for message sending
    const sendSpy = sinon.spy();

    // Chat picture controller
    let chatPicture: any;

    before(async () => {
        // Import the controller with a spy on the notification function
        chatPicture = proxyquire('../../../controllers/chat_picture', {
            './notification/chat': { sendChatMessage: sendSpy }
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('No count', async () => {
        const req: any = {
            userID: 2,
            params: {
                associationID: 3
            },
            body: {}
        };

        // @ts-ignore
        const result = await chatPicture.createPictureMessage(req, res, next);
        expect(result).to.be.an('Error');
        expect(result.message).to.equal('Need number of pictures');
    });

    it('Create message', async () => {
        const partnerID = 5;
        const req: any = {
            userID: 2,
            params: {
                associationID: 3
            },
            body: { count: 2 },
            association: { getPartnerID: (_: number) => partnerID }
        };

        // Get creation function of models.ChatPicture.create to return
        // argument and a toJSON function
        sandbox.replace(models.ChatPicture, 'create', (input: any) => {
            return { ...input, toJSON: () => input };
        });

        // Define ID of created message
        const createdMessageID = 1;
        // Replace create function by getting it to return its argument,
        // a setPictures function and a fake id
        sandbox.replace(models.Message, 'create', (input: any) => {
            return {
                ...wrapToJSON({
                    ...input,
                    id: createdMessageID
                }),
                setPictures: sinon.mock().returnsArg(0)
            };
        });

        // Replace query for name
        const name = 'foo';
        sandbox.replace(models.User, 'scope', (scope: string) => {
            return {
                findById: (_: number) => {
                    return { name };
                }
            };
        });

        // Should get message with ID back and an array of pictures
        // @ts-ignore
        const result = await chatPicture.createPictureMessage(req, res, next);
        expect(result.id).to.equal(createdMessageID);
        expect(result.authorId).to.equal(req.userID);
        expect(result.associationId).to.equal(req.params.associationID);
        expect(result.type).to.equal('Picture');
        expect(result.pictures).to.have.lengthOf(req.body.count);

        // Check send message spy
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal(name);
        expect(sendSpy.lastCall.args[1]).to.equal(partnerID);
        expect(sendSpy.lastCall.args[2]).to.equal(req.params.associationID);
        expect(sendSpy.lastCall.args[3]).to.equal('Picture message');
    });
});
