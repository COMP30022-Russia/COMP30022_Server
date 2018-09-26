import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Notification - Update Token', () => {
    const agent = request.agent(app);
    let userToken: string;

    before(async () => {
        // Create AP, carer and association
        userToken = await createAP('n1');
    });

    it('Add token', async () => {
        const payload = {
            token: 'i_am_a_totally_legitimate_token',
            instanceID: '1'
        };
        const res = await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });

    it('Replace token', async () => {
        const payload = { token: 'new_token', instanceID: '1' };
        const res = await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });
});
