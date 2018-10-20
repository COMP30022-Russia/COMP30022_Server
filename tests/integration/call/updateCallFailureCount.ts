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
    let callID: number;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_failure_carer')).token;
        apToken = (await createAP('nav_call_failure_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const session = await createNavigationSession(apToken, association.id);
        navSessionID = session.id;

        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        callID = call.id;
    });

    it('Trigger call failure', async () => {
        // Note that default threshold is currently 5
        // Trigger failure 4 times
        // Call should still be active
        for (const _ of Array(4).keys()) {
            const failRes = await agent
                .post(`/calls/${callID}/failure`)
                .set('Authorization', `Bearer ${apToken}`);
            expect(failRes.body).have.property('status');
            expect(failRes.body.status).to.equal('success');
        }
        const res = await agent
            .get(`/calls/${callID}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res.body).to.have.property('state');
        expect(res.body.state).to.equal('Pending');

        // Terminate one more time
        const fifthTerminateRes = await agent
            .post(`/calls/${callID}/failure`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(fifthTerminateRes.body).have.property('status');
        expect(fifthTerminateRes.body.status).to.equal('success');
        // Call should be terminated now
        const afterTerminateRes = await agent
            .get(`/calls/${callID}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(afterTerminateRes.body).to.have.property('state');
        expect(afterTerminateRes.body.state).to.equal('Terminated');
    });
});
