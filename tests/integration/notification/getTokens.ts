import { expect, request } from 'chai';
import app from '../../';
import { createAP } from '../helpers/user';

describe('Notification', () => {
    const agent = request.agent(app);

    let userToken: string;

    before(async () => {
        // Create user
        userToken = (await createAP('n2')).token;
    });

    it('Get Firebase tokens when user has no tokens', async () => {
        const res = await agent
            .get('/me/token')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('tokens');
        expect(res.body.tokens).to.have.lengthOf(0);
    });

    it('Get Firebase tokens', async () => {
        // First, add a token
        const payload = { token: 'tok', instanceID: '1' };
        await agent
            .post('/me/token')
            .set('Authorization', `Bearer ${userToken}`)
            .send(payload);

        // Get first token
        const res1 = await agent
            .get('/me/token')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('id');
        expect(res1.body).to.have.property('tokens');
        expect(res1.body.tokens).to.have.lengthOf(1);
        expect(res1.body.tokens[0]).to.equal(payload.token);

        // Then, add another token with different instance ID
        const payload2 = { token: 't', instanceID: '2' };
        await agent
            .post('/me/token')
            .set('Authorization', `Bearer ${userToken}`)
            .send(payload2);

        // Get both tokens
        const res2 = await agent
            .get('/me/token')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('tokens');
        expect(res2.body.tokens).to.have.lengthOf(2);
    });
});
