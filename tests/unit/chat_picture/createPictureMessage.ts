import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import { res, next } from '../index';
import models from '../../../models';
import { createPictureMessage } from '../../../controllers/chat_picture';

describe('Unit - Chat - Create Picture message', () => {
    const sandbox = sinon.createSandbox();

    // Spy for message sending
    const sendSpy = sinon.spy();

    let chat_picture: any;
    before(async () => {
        // Import the controller with a spy on the notification function
        chat_picture = proxyquire('../../../controllers/chat_picture', {
            './notification/chat': { sendChatMessage: sendSpy }
        });
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
        const result = await chat_picture.createPictureMessage(req, res, next);
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
        // ID of created message
        const createdMessageID: number = 1;

        // Get creation function of models.Picture.create to return argument
        // and a toJSON function
        sandbox.replace(models.Picture, 'create', (input: any) => {
            return { ...input, toJSON: () => input };
        });

        // Replace create function by getting it to return its argument,
        // a setPictures function and a fake id
        sandbox.replace(models.Message, 'create', (input: any) => {
            return {
                ...input,
                id: createdMessageID,
                setPictures: sinon.mock().returnsArg(0),
                toJSON: () => {
                    return { ...input, id: createdMessageID };
                }
            };
        });

        // Replace query for name
        const name = 'foo';
        sandbox.replace(models.User, 'scope', (scope: string) => {
            if (scope === 'name') {
                return {
                    findById: (_: number) => {
                        return { name };
                    }
                };
            }
        });

        // Should get message with ID back and an array of pictures
        // @ts-ignore
        const result = await chat_picture.createPictureMessage(req, res, next);
        expect(result.id).to.equal(createdMessageID);
        expect(result.authorId).to.equal(req.userID);
        expect(result.associationId).to.equal(req.params.associationID);
        expect(result.type).to.equal('Picture');
        expect(result.pictures).to.have.lengthOf(req.body.count);

        // Check send message spy
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(
                name,
                partnerID,
                req.params.associationID,
                'Picture message'
            )
        ).to.equal(true);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
