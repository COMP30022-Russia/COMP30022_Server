import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Chat', () => {
    const agent = request.agent(app);

    let apToken: string;
    let carerToken: string;
    let associationID: number;

    before(async () => {
        // Create AP, carer
        apToken = (await createAP('ca1')).token;
        carerToken = (await createCarer('cc1')).token;

        // Create association
        const association = await createAssociation(apToken, carerToken);
        associationID = association.id;
    });

    it('Carer creates message', async () => {
        const payload = { content: 'Hello world' };
        const res = await agent
            .post(`/associations/${associationID}` + '/chat')
            .set('Authorization', `Bearer ${carerToken}`)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.content).to.equal(payload.content);
    });

    it('AP creates message', async () => {
        const payload = { content: 'Hello world back' };
        const res = await agent
            .post(`/associations/${associationID}` + '/chat')
            .set('Authorization', `Bearer ${apToken}`)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.content).to.equal(payload.content);
    });

    it('Message without payload', async () => {
        const payload = { content: '' };
        const res = await agent
            .post(`/associations/${associationID}` + '/chat')
            .set('Authorization', `Bearer ${apToken}`)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
