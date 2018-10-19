import { expect } from 'chai';
import sinon from 'sinon';
import { next, res } from '../index';

import models from '../../../models';
import { getMessagePicture } from '../../../controllers/chat_picture';

describe('Chat - Get message picture', () => {
    const sandbox = sinon.createSandbox();

    afterEach(async () => {
        sandbox.restore();
    });

    // When picture is not associated with association or when picture
    // id is not correct
    it('Get invalid/missing picture', async () => {
        const req: any = {
            userID: 1,
            params: {
                associationID: 2,
                pictureID: 3
            }
        };

        // Fake retrieval function to return nothing
        sandbox.replace(models.ChatPicture, 'findOne', sinon.fake());

        // @ts-ignore
        const result = await getMessagePicture(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Picture cannot be retrieved');
    });

    it('Get picture', async () => {
        const req: any = {
            userID: 1,
            params: {
                associationID: 2,
                pictureID: 3
            }
        };

        // Redefine res to have setHeader and sendFile
        const setHeaderSpy = sinon.spy();
        const sendFileSpy = sinon.spy();
        const fileRes: any = {
            setHeader: setHeaderSpy,
            sendFile: sendFileSpy,
            status: sinon.spy()
        };

        // Fake retrieval function to return a partial picture object
        const picture = {
            id: 3,
            mime: 'foo',
            filename: 'bar',
            status: 'Received'
        };
        sandbox.replace(
            models.ChatPicture,
            'findOne',
            sinon.stub().returns(picture)
        );

        // @ts-ignore
        const result = await getMessagePicture(req, fileRes, next);

        // Check spies
        expect(setHeaderSpy.calledOnce).to.equal(true);
        expect(
            setHeaderSpy.alwaysCalledWith('Content-Type', picture.mime)
        ).to.equal(true);
        expect(
            sendFileSpy.alwaysCalledWith(picture.filename, {
                root: 'uploads/chat'
            })
        );
    });

    it('Get non received picture', async () => {
        const req: any = {
            userID: 1,
            params: {
                associationID: 2,
                pictureID: 3
            }
        };

        // Redefine res
        const statusSpy = sinon.spy();
        const fileRes: any = {
            status: statusSpy
        };

        // Fake retrieval function to return a partial picture object
        const picture = {
            id: 3,
            mime: 'foo',
            filename: 'bar',
            status: 'Sending'
        };
        sandbox.replace(
            models.ChatPicture,
            'findOne',
            sinon.stub().returns(picture)
        );

        // @ts-ignore
        const result: any = await getMessagePicture(req, fileRes, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Picture has not been received by server yet'
        );

        // Check spies
        expect(statusSpy.calledOnce).to.equal(true);
    });
});
