import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next, wrapToJSON } from '../index';

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
                mimetype: 'foo',
                filename: 'bar'
            },
            association: { getPartnerID: (_: number) => partnerID }
        };

        // Fake retrieval function to return a partial picture object
        const picture: any = {
            id: 3,
            status: 'Sending'
        };
        picture.updateAttributes = (attributes: any) => {
            return wrapToJSON({
                ...picture,
                ...attributes
            });
        };
        sandbox.replace(
            models.ChatPicture,
            'findOne',
            sinon.stub().returns(picture)
        );

        // Expect to get picture with mime and filename back
        // @ts-ignore
        const result = await chat_picture.uploadPicture(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('mime');
        expect(result).to.have.property('filename');
        expect(result).to.have.property('status');
        expect(result.id).to.equal(picture.id);
        expect(result.mime).to.equal(req.file.mimetype);
        expect(result.filename).to.equal(req.file.filename);
        expect(result.status).to.equal('Received');

        // Check send message spy
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(
                partnerID,
                req.params.associationID,
                picture.id
            )
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

    it('Set already received picture', async () => {
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
