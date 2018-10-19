import { expect, request } from 'chai';
import app from '../../';
import { createCarer } from '../helpers/user';

describe('Auth', () => {
    const agent = request.agent(app);

    // Auth token
    let userToken: string;

    // Define Firebase tokens of user
    const payload1 = {
        token: 'tok1',
        instanceID: 'inst1'
    };
    const payload2 = {
        token: 'tok2',
        instanceID: 'inst2'
    };

    before(async () => {
        // Register as user
        userToken = (await createCarer('logout')).token;

        // Add Firebase tokens
        await agent
            .post('/me/token')
            .set('Authorization', `Bearer ${userToken}`)
            .send(payload1);
        await agent
            .post('/me/token')
            .set('Authorization', `Bearer ${userToken}`)
            .send(payload2);
    });

    it('Logout without instanceID', async () => {
        const res = await agent
            .post('/me/logout')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Logout with instanceID specified', async () => {
        // Logout with instanceID of first 'device'
        const res = await agent
            .post('/me/logout')
            .send({ instanceID: payload1.instanceID })
            .set('Authorization', `Bearer ${userToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Check tokens of user
        const resToken = await agent
            .get('/me/token')
            .set('Authorization', `Bearer ${userToken}`);
        expect(resToken).to.be.json;
        expect(resToken).to.have.status(200);
        expect(resToken.body).to.have.property('id');
        expect(resToken.body).to.have.property('tokens');
        expect(resToken.body.tokens).to.have.lengthOf(1);
        expect(resToken.body.tokens[0]).to.equal(payload2.token);
    });
});
