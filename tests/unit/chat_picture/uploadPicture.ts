import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';
import { uploadPicture } from '../../../controllers/chat_picture';

describe('Unit - Chat - Upload message picture', () => {
    const sandbox = sinon.createSandbox();

    // Spy for message sending
    const sendSpy = sinon.spy();

    let chat_picture: any;
    before(async () => {
        // Import the controller with a spy on the notification function
        chat_picture = proxyquire('../../../controllers/chat_picture', {
            './notification/chat': { sendChatPictureUploadMessage: sendSpy }
        });
    });

    it('Set picture', async () => {
        const partnerID = 5;
        const req: any = {
            userID: 1,
            params: {
                associationID: 2,
                pictureID: 3
            },
            file: {
                mime: 'foo',
                filename: 'bar'
            },
            association: { getPartnerID: (_: number) => partnerID }
        };

        // Fake retrieval function to return a partial picture object
        const picture: any = {
            id: 3,
            status: 'Sending',
            save: sinon.fake()
        };
        sandbox.replace(
            models.ChatPicture,
            'findOne',
            sinon.stub().returns(picture)
        );

        // Expect to get picture with mime and filename back
        // @ts-ignore
        const result = await chat_picture.uploadPicture(req, res, next);
        expect(picture).to.have.property('id');
        expect(picture).to.have.property('mime');
        expect(picture).to.have.property('filename');
        expect(picture).to.have.property('status');
        expect(picture.id).to.equal(picture.id);
        expect(picture.mime).to.equal(picture.mime);
        expect(picture.filename).to.equal(picture.filename);
        expect(picture.status).to.equal('Received');

        // Check send message spy
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(partnerID, req.params.associationID)
        ).to.equal(true);
    });

    it('Set invalid picture', async () => {
        const req: any = {
            userID: 1,
            params: {
                associationID: 2,
                pictureID: 3
            }
        };

        // Fake retrieval function to return a null object
        sandbox.replace(models.ChatPicture, 'findOne', sinon.fake());

        // @ts-ignore
        const result = await chat_picture.uploadPicture(req, res, next);
        expect(result).to.be.an('Error');
        expect(result.message).to.equal('Picture cannot be set');
    });

    it('Set received picture', async () => {
        const req: any = {
            userID: 1,
            params: {
                associationID: 2,
                pictureID: 3
            }
        };

        // Fake retrieval function to return a partial picture object
        const picture = {
            id: 3,
            status: 'Received',
            save: sinon.fake()
        };
        sandbox.replace(
            models.ChatPicture,
            'findOne',
            sinon.stub().returns(picture)
        );

        // @ts-ignore
        const result = await chat_picture.uploadPicture(req, res, next);
        expect(result).to.be.an('Error');
        expect(result.message).to.equal('Picture has already been received');
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
