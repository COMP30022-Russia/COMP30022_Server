import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../../helpers/user';

describe('Chat - Create Message', () => {
    const agent = request.agent(app);
    let APToken: string, carerToken: string;
    let associationID: number;

    before(async () => {
        // Create AP, carer and association
        APToken = await createAP('ca1');
        carerToken = await createCarer('cc1');
        associationID = await createAssociation(APToken, carerToken);
    });

    it('AP creates message', async () => {
        const payload = { content: 'Hello world' };
        const res = await agent
            .post('/associations/' + associationID + '/chat')
            .set('Authorization', 'Bearer ' + carerToken)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.content).to.equal(payload.content);
    });

    it('Carer creates message', async () => {
        const payload = { content: 'Hello world back' };
        const res = await agent
            .post('/associations/' + associationID + '/chat')
            .set('Authorization', 'Bearer ' + APToken)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.content).to.equal(payload.content);
    });

    it('Message without payload', async () => {
        const payload = { content: '' };
        const res = await agent
            .post('/associations/' + associationID + '/chat')
            .set('Authorization', 'Bearer ' + APToken)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
