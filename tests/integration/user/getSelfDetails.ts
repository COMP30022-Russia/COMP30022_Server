import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('User details', () => {
    const agent = request.agent(app);
    let userToken: string;

    before(async () => {
        // Create AP, carer and association
        userToken = await createAP('get_self_details');
    });

    // Get profile information of current authenticated user
    it('Get profile', async () => {
        const res = await agent
            .get('/me/profile')
            .set('Authorization', 'Bearer ' + userToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
    });
});
