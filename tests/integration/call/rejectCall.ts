import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import {
    createNavigationSession,
    startNavigationCall
} from '../helpers/navigation';

describe('Navigation call', () => {
    const agent = request.agent(app);

    let carerToken: string;
    let apToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_reject_carer')).token;
        apToken = (await createAP('nav_call_reject_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            apToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Reject call as initiator', async () => {
        // Create call as carer
        const call = await startNavigationCall(carerToken, navSessionID);
        const callID = call.id;

        // Reject call
        const res1 = await agent
            .post(`/calls/${callID}/reject`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('status');
        expect(res1.body.status).to.equal('success');

        // Create call as AP
        const call2 = await startNavigationCall(apToken, navSessionID);
        const callID2 = call2.id;

        // Reject call
        const res2 = await agent
            .post(`/calls/${callID2}/reject`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('status');
        expect(res2.body.status).to.equal('success');
    });

    it('Reject call as receiver', async () => {
        // Create call as carer
        const call = await startNavigationCall(carerToken, navSessionID);
        const callID = call.id;

        // Reject call
        const res1 = await agent
            .post(`/calls/${callID}/reject`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('status');
        expect(res1.body.status).to.equal('success');

        // Create call as AP
        const call2 = await startNavigationCall(apToken, navSessionID);
        const callID2 = call2.id;

        // Reject call
        const res2 = await agent
            .post(`/calls/${callID2}/reject`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('status');
        expect(res2.body.status).to.equal('success');
    });
});
