import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('User profile - Get profile picture', () => {
    const agent = request.agent(app);
    let APToken: string, carerToken: string;
    let APID: number;

    before(async () => {
        // Create associated AP and carer pair
        APToken = (await createAP('picture_get_ap')).token;
        carerToken = (await createCarer('picture_get_carer')).token;

        // Create association
        const association = await createAssociation(APToken, carerToken);
        APID = association.APId;

        // Set profile picture
        await agent
            .post('/me/profile/picture')
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', 'Bearer ' + APToken)
            .attach(
                'picture',
                readFileSync(__dirname + '/../helpers/yc.png'),
                '1.png'
            );
    });

    it('Get picture as self', async () => {
        // Get picture
        const res = await agent
            .get('/me/profile/picture')
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.have.status(200);
        expect(res.body).to.be.instanceof(Buffer);
    });

    it('Get picture as associated user', async () => {
        // Get picture
        const res = await agent
            .get(`/users/${APID}/picture`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.have.status(200);
        expect(res.body).to.be.instanceof(Buffer);
    });
});
