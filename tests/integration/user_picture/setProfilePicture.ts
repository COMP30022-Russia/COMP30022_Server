import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP } from '../helpers/user';

describe('User profile', () => {
    const agent = request.agent(app);

    let userToken: string;

    before(async () => {
        // Create user
        userToken = (await createAP('user_picture_upload')).token;
    });

    it('Invalid profile picture upload', async () => {
        const res = await agent
            .post('/me/profile/picture')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Upload profile picture', async () => {
        const res = await agent
            .post('/me/profile/picture')
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', `Bearer ${userToken}`)
            .attach(
                'picture',
                readFileSync(`${__dirname}/../helpers/yc.png`),
                '1.png'
            );
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('mime');
        expect(res.body).to.have.property('filename');
        expect(res.body.mime).to.equal('image/png');
    });
});
