import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../../helpers/user';

describe('Notification - Update Token', () => {
    const agent = request.agent(app);
    let userToken: string;

    before(async () => {
        // Create AP, carer and association
        userToken = await createAP('n1');
    });

    it('Add token', async () => {
        const payload = { new: 'i_am_a_totally_legitimate_token' };
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
        const payload = { new: 'i_am_a_totally_legitimate_token' };
        const res = await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload);

        const payload2 = { old: 'i_am_a_totally_legitimate_token', new: 'a' };
        const res2 = await agent
            .post('/me/token')
            .set('Authorization', 'Bearer ' + userToken)
            .send(payload2);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('status');
        expect(res2.body.status).to.equal('success');
    });
});
