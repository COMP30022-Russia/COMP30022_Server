import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';
import { setProfilePicture } from '../../../controllers/user_picture';

describe('Unit - User Profile - Upload profile picture', () => {
    const sandbox = sinon.createSandbox();

    it('Set picture', async () => {
        const req: any = {
            userID: 1,
            file: {
                mimetype: 'image/png',
                filename: 'foo'
            }
        };

        // Stub create function to return its argument
        sandbox.replace(models.ProfilePicture, 'create', (properties: any) => {
            return {
                ...properties,
                toJSON: () => properties
            };
        });

        // Expect to get picture with mime and filename back
        // @ts-ignore
        const result = await setProfilePicture(req, res, next);
        expect(result).to.have.property('userId');
        expect(result).to.have.property('mime');
        expect(result).to.have.property('filename');
        expect(result.userId).to.equal(req.userID);
        expect(result.mime).to.equal(req.file.mimetype);
        expect(result.filename).to.equal(req.file.filename);
    });

    afterEach(async () => {
        sandbox.restore();
    });
});
