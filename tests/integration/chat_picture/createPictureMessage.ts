import { expect, request } from 'chai';
import { readFileSync } from 'fs';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../../helpers/user';

describe('Chat - Create Picture Message', () => {
    const agent = request.agent(app);
    let APToken: string, carerToken: string;
    let associationID: number;

    before(async () => {
        // Create carer
        APToken = await createAP('cpa1');
        carerToken = await createCarer('cpc1');

        // Create association
        const association = await createAssociation(APToken, carerToken);
        associationID = association.id;
    });

    it('Create picture message without count', async () => {
        const res = await agent
            .post('/associations/' + associationID + '/chat/picture')
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Create picture message with bad count', async () => {
        const res = await agent
            .post('/associations/' + associationID + '/chat/picture')
            .send({ count: 0 })
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Create picture message', async () => {
        // Create the picture message
        const res = await agent
            .post('/associations/' + associationID + '/chat/picture')
            .set('Authorization', 'Bearer ' + carerToken)
            .send({ count: 2 });

        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('type');
        expect(res.body).to.have.property('associationId');
        expect(res.body).to.have.property('authorId');
        expect(res.body).to.have.property('pictures');
        expect(res.body.type).to.equal('Picture');
        expect(res.body.pictures).to.have.lengthOf(2);
    });
});
