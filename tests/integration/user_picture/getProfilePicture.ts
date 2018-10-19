import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('User profile', () => {
    const agent = request.agent(app);

    let apToken: string;
    let carerToken: string;
    let APID: number;

    before(async () => {
        // Create associated AP and carer pair
        apToken = (await createAP('picture_get_ap')).token;
        carerToken = (await createCarer('picture_get_carer')).token;

        // Create association
        const association = await createAssociation(apToken, carerToken);
        APID = association.APId;

        // Set profile picture
        await agent
            .post('/me/profile/picture')
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', `Bearer ${apToken}`)
            .attach(
                'picture',
                readFileSync(`${__dirname}/../helpers/yc.png`),
                '1.png'
            );
    });

    it('Get profile picture', async () => {
        const res = await agent
            .get('/me/profile/picture')
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.have.status(200);
        expect(res.body).to.be.instanceof(Buffer);
    });

    it('Get profile picture as associated user', async () => {
        const res = await agent
            .get(`/users/${APID}/picture`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.have.status(200);
        expect(res.body).to.be.instanceof(Buffer);
    });
});
