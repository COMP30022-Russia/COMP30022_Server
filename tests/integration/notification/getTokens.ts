import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Notification - Get Token', () => {
    const agent = request.agent(app);
    let userToken: string;

    before(async () => {
        // Create AP, carer and association
        userToken = await createAP('n2');
    });

    it('Get empty', async () => {
        // Then, get tokens
        const res = await agent
            .get('/me/token')
            .set('Authorization', 'Bearer ' + userToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('tokens');
        expect(res.body.tokens).to.have.lengthOf(0);
    });

    it('Get tokens', async () => {
        // First, add a token
        const payload = { token: 'tok', instanceID: '1' };
        await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload);

        // Get first token
        const res = await agent
            .get('/me/token')
            .set('Authorization', 'Bearer ' + userToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('tokens');
        expect(res.body.tokens).to.have.lengthOf(1);
        expect(res.body.tokens[0]).to.equal(payload.token);

        // Then, add another token with different instance ID
        const payload2 = { token: 't', instanceID: '2' };
        await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload2);

        // Finally, get tokens
        const res2 = await agent
            .get('/me/token')
            .set('Authorization', 'Bearer ' + userToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('tokens');
        expect(res2.body.tokens).to.have.lengthOf(2);
    });
});
