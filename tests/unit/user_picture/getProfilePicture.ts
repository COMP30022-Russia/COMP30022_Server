import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import models from '../../../models';
import { getProfilePicture } from '../../../controllers/user_picture';

describe('Unit - User Profile - Get profile picture', () => {
    const sandbox = sinon.createSandbox();

    // When picture has not been set yet
    it('Get invalid/missing picture', async () => {
        const req: any = {
            userID: 1,
            params: {}
        };

        // Fake retrieval function to return nothing
        sandbox.replace(models.ProfilePicture, 'findOne', sinon.fake());

        // @ts-ignore
        const result = await getProfilePicture(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Picture cannot be retrieved');
    });

    it('Get picture', async () => {
        const req: any = {
            userID: 1,
            params: {}
        };

        // Redefine res to have setHeader and sendFile
        const setHeaderSpy = sinon.spy();
        const sendFileSpy = sinon.spy();
        const res: any = {
            setHeader: setHeaderSpy,
            sendFile: sendFileSpy,
            status: sinon.spy()
        };

        // Fake retrieval function to return a partial picture object
        const picture = {
            id: 3,
            mime: 'foo',
            filename: 'bar'
        };
        sandbox.replace(
            models.ProfilePicture,
            'findOne',
            sinon.stub().returns(picture)
        );

        // @ts-ignore
        const result = await getProfilePicture(req, res, next);

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

    afterEach(async () => {
        sandbox.restore();
    });
});
