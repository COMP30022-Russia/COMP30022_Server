import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Chat', () => {
    const agent = request.agent(app);

    let apToken: string;
    let carerToken: string;
    let associationID: number;

    before(async () => {
        // Create AP, carer
        apToken = (await createAP('cpa2')).token;
        carerToken = (await createCarer('cpc2')).token;

        // Create association
        const association = await createAssociation(apToken, carerToken);
        associationID = association.id;
    });

    it('Invalid upload ID', async () => {
        const res1 = await agent
            .post(`/associations/${associationID}` + '/chat/picture/1')
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(400);

        const res2 = await agent
            .post(`/associations/${associationID}` + '/chat/picture/10000')
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(400);
        expect(res2.body.message).to.equal('No file given');
    });

    it('Upload picture', async () => {
        // Create picture message
        const res = await agent
            .post(`/associations/${associationID}` + '/chat/picture')
            .set('Authorization', `Bearer ${carerToken}`)
            .send({ count: 2 });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body.pictures).to.have.lengthOf(2);

        // Upload pictures
        const res1 = await agent
            .post(
                `/associations/${associationID}/chat/picture/${res.body.pictures[0].id}`
            )
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', `Bearer ${carerToken}`)
            .attach(
                'picture',
                readFileSync(`${__dirname}/../helpers/yc.png`),
                '1.png'
            );
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('id');
        expect(res1.body).to.have.property('associationId');
        expect(res1.body).to.have.property('mime');
        expect(res1.body).to.have.property('filename');
        expect(res1.body).to.have.property('status');
        expect(res1.body.mime).to.equal('image/png');
        expect(res1.body.status).to.equal('Received');

        const res2 = await agent
            .post(
                `/associations/${associationID}/chat/picture/${res.body.pictures[1].id}`
            )
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', `Bearer ${carerToken}`)
            .attach(
                'picture',
                readFileSync(`${__dirname}/../helpers/yc.png`),
                '2.png'
            );
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('associationId');
        expect(res2.body).to.have.property('mime');
        expect(res2.body).to.have.property('filename');
        expect(res2.body).to.have.property('status');
        expect(res2.body.mime).to.equal('image/png');
        expect(res2.body.status).to.equal('Received');
    });
});
