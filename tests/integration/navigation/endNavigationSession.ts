import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import { createNavigationSession } from '../helpers/navigation';

describe('Navigation session', () => {
    const agent = request.agent(app);

    let carerToken: string;
    let apToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_end_carer')).token;
        apToken = (await createAP('nav_end_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            apToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('End navigation session', async () => {
        // First end session, expect { status: 'success' }
        const res = await agent
            .post(`/navigation/${navSessionID}/end`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Then query for session to check status
        const sessionRes = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(sessionRes).to.be.json;
        expect(sessionRes).to.have.status(200);
        expect(sessionRes.body).to.have.property('active');
        expect(sessionRes.body.active).to.equal(false);
    });

    it('Try to end already ended navigation session', async () => {
        const res = await agent
            .post(`/navigation/${navSessionID}/end`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
