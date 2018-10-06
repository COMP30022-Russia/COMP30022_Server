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
    let callID: number;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_failure_carer')).token;
        APToken = (await createAP('nav_call_failure_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const session = await createNavigationSession(APToken, association.id);
        navSessionID = session.id;

        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        callID = call.id;
    });

    it('Trigger call failure', async () => {
        // Note that default threshold is currently 5
        // Trigger failure 4 times
        // Call should still be active
        for (const i in [...Array(4).keys()]) {
            const res = await agent
                .post(`/call/${callID}/failure`)
                .set('Authorization', 'Bearer ' + APToken);
            expect(res.body).have.property('status');
            expect(res.body.status).to.equal('success');
        }
        const r1 = await agent
            .get(`/call/${callID}`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(r1.body).to.have.property('state');
        expect(r1.body.state).to.equal('Pending');

        // Call should be terminated after 5th call
        const res = await agent
            .post(`/call/${callID}/failure`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res.body).have.property('status');
        expect(res.body.status).to.equal('success');
        const r2 = await agent
            .get(`/call/${callID}`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(r2.body).to.have.property('state');
        expect(r2.body.state).to.equal('Terminated');
    });
});
