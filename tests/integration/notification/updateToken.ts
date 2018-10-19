import { expect, request } from 'chai';
import app from '../../';
import { createAP } from '../helpers/user';

describe('Notification', () => {
    const agent = request.agent(app);

    let userToken: string;

    before(async () => {
        // Create user
        userToken = (await createAP('n1')).token;
    });

    it('Add Firebase token', async () => {
        const res = await agent
            .post('/me/token')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ token: 'orig_token', instanceID: '1' });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });

    it('Replace Firebase token', async () => {
        const res = await agent
            .post('/me/token')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ token: 'new_token', instanceID: '1' });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });
});
