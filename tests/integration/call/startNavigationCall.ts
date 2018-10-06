import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import { createNavigationSession } from '../helpers/navigation';

describe('Navigation call', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_start_carer')).token;
        APToken = (await createAP('nav_call_start_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Start call', async () => {
        // Update AP location
        const res = await agent
            .post(`/navigation/${navSessionID}/call`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('state');
        expect(res.body).to.have.property('sessionId');
        expect(res.body).to.have.property('sync');
        expect(res.body).to.have.property('failureCount');
        expect(res.body.state).to.equal('Pending');
        expect(res.body.sessionId).to.equal(navSessionID);
        expect(res.body.sync).to.equal(1);
        expect(res.body.failureCount).to.equal(0);
    });

    it('Try to start another call', async () => {
        // Update AP location
        const res = await agent
            .post(`/navigation/${navSessionID}/call`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
