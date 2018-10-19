import { expect, request } from 'chai';
import app from '../../';
import { createAP } from '../helpers/user';

describe('User details', () => {
    const agent = request.agent(app);

    let userToken: string;

    before(async () => {
        // Create AP, carer and association
        userToken = (await createAP('get_self_details')).token;
    });

    // Get profile information of current authenticated user
    it('Get my profile', async () => {
        const res = await agent
            .get('/me/profile')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
    });
});
