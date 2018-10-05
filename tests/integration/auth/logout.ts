import { expect, request } from 'chai';
import app from '../../';
import { createCarer } from '../helpers/user';

describe('User logout', () => {
    const agent = request.agent(app);

    // Tokens
    let userToken: string;

    // The tokens that are added
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

        // Add some tokens
        await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload1);
        await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload2);
    });

    it('Logout without instanceID', async () => {
        const res = await agent
            .post('/me/logout')
            .set('Authorization', 'Bearer ' + userToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Logout with instanceID specified', async () => {
        // Logout with instanceID of first 'device'
        const res = await agent
            .post('/me/logout')
            .send({ instanceID: payload1.instanceID })
            .set('Authorization', 'Bearer ' + userToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Check the token that is left
        const r = await agent
            .get('/me/token')
            .set('Authorization', 'Bearer ' + userToken);
        expect(r).to.be.json;
        expect(r).to.have.status(200);
        expect(r.body).to.have.property('id');
        expect(r.body).to.have.property('tokens');
        expect(r.body.tokens).to.have.lengthOf(1);
        expect(r.body.tokens[0]).to.equal(payload2.token);
    });
});
