import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Chat - Upload picture', () => {
    const agent = request.agent(app);
    let APToken: string, carerToken: string;
    let associationID: number;

    before(async () => {
        // Create carer
        APToken = (await createAP('cpa2')).token;
        carerToken = (await createCarer('cpc2')).token;

        // Create association
        const association = await createAssociation(APToken, carerToken);
        associationID = association.id;
    });

    it('Invalid upload', async () => {
        const res = await agent
            .post('/associations/' + associationID + '/chat/picture/1')
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Invalid upload 2', async () => {
        const res = await agent
            .post('/associations/' + associationID + '/chat/picture/10000')
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('No file given');
    });

    it('Upload picture', async () => {
        // Create the picture message
        const r = await agent
            .post('/associations/' + associationID + '/chat/picture')
            .set('Authorization', 'Bearer ' + carerToken)
            .send({ count: 2 });
        expect(r).to.be.json;
        expect(r).to.have.status(200);
        expect(r.body.pictures).to.have.lengthOf(2);

        // Upload pictures
        const res = await agent
            .post(
                '/associations/' +
                    associationID +
                    '/chat/picture/' +
                    r.body.pictures[0].id
            )
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', 'Bearer ' + carerToken)
            .attach(
                'picture',
                readFileSync(__dirname + '/../helpers/yc.png'),
                '1.png'
            );
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('associationId');
        expect(res.body).to.have.property('mime');
        expect(res.body).to.have.property('filename');
        expect(res.body).to.have.property('status');
        expect(res.body.mime).to.equal('image/png');
        expect(res.body.status).to.equal('Received');

        const res2 = await agent
            .post(
                '/associations/' +
                    associationID +
                    '/chat/picture/' +
                    r.body.pictures[1].id
            )
            .set('Content-Type', 'multipart/formdata')
            .set('Authorization', 'Bearer ' + carerToken)
            .attach(
                'picture',
                readFileSync(__dirname + '/../helpers/yc.png'),
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
