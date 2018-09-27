import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Chat - Get Picture Message', () => {
    const agent = request.agent(app);
    let APToken: string, carerToken: string;
    let associationID: number;

    before(async () => {
        // Create carer
        APToken = await createAP('cpa3');
        carerToken = await createCarer('cpc3');

        // Create association
        const association = await createAssociation(APToken, carerToken);
        associationID = association.id;

        // Create the picture message
        const r = await agent
            .post('/associations/' + associationID + '/chat/picture')
            .set('Authorization', 'Bearer ' + carerToken)
            .send({ count: 2 });
        // Upload pictures
        const r1 = await agent
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
        const r2 = await agent
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

        expect(r).to.have.status(200);
        expect(r1).to.have.status(200);
        expect(r2).to.have.status(200);
    });

    it('Get picture message', async () => {
        // Get messages
        const res = await agent
            .get('/associations/' + associationID + '/chat')
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('messages');
        expect(res.body.messages).to.have.lengthOf(1);

        // Verify properties of picture message
        expect(res.body.messages[0]).to.have.property('id');
        expect(res.body.messages[0]).to.have.property('type');
        expect(res.body.messages[0]).to.have.property('associationId');
        expect(res.body.messages[0]).to.have.property('authorId');
        expect(res.body.messages[0]).to.have.property('pictures');
        expect(res.body.messages[0].type).to.equal('Picture');
        expect(res.body.messages[0].pictures).to.have.lengthOf(2);
    });

    it('Get message pictures', async () => {
        // Get the ids of the pictures
        const r = await agent
            .get('/associations/' + associationID + '/chat')
            .set('Authorization', 'Bearer ' + carerToken);
        const picture1ID = r.body.messages[0].pictures[0].id;
        const picture2ID = r.body.messages[0].pictures[1].id;

        // Request images, ensure that buffers are returned
        const res = await agent
            .get(
                '/associations/' + associationID + '/chat/picture/' + picture1ID
            )
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.have.status(200);
        expect(res.body).to.be.instanceof(Buffer);

        const res2 = await agent
            .get(
                '/associations/' + associationID + '/chat/picture/' + picture2ID
            )
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.have.status(200);
        expect(res2.body).to.be.instanceof(Buffer);
    });

    it('Get invalid message picture', async () => {
        const res = await agent
            .get('/associations/' + associationID + '/chat/picture/bad')
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.have.status(400);
        expect(res).to.be.json;
    });
});
