import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import {
    createNavigationSession,
    startNavigationCall
} from '../helpers/navigation';

describe('Navigation call', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_reject_carer')).token;
        APToken = (await createAP('nav_call_reject_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Reject call as initiator', async () => {
        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        const callID = call.id;

        const res = await agent
            .post(`/call/${callID}/reject`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Create call
        const call2 = await startNavigationCall(APToken, navSessionID);
        const callID2 = call2.id;

        const res2 = await agent
            .post(`/call/${callID2}/reject`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('status');
        expect(res2.body.status).to.equal('success');
    });

    it('Reject call as receiver', async () => {
        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        const callID = call.id;

        const res = await agent
            .post(`/call/${callID}/reject`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Create call
        const call2 = await startNavigationCall(APToken, navSessionID);
        const callID2 = call2.id;

        const res2 = await agent
            .post(`/call/${callID2}/reject`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('status');
        expect(res2.body.status).to.equal('success');
    });
});
