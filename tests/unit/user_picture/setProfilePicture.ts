import { expect } from 'chai';
import sinon from 'sinon';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';
import { setProfilePicture } from '../../../controllers/user_picture';

describe('User Profile - Upload profile picture', () => {
    const sandbox = sinon.createSandbox();

    after(async () => {
        sandbox.restore();
    });

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
            return wrapToJSON(properties);
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
});
