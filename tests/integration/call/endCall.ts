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
        carerToken = (await createCarer('nav_call_terminate_carer')).token;
        apToken = (await createAP('nav_call_terminate_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const session = await createNavigationSession(apToken, association.id);
        navSessionID = session.id;

        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        callID = call.id;
    });

    it('End call', async () => {
        const res = await agent
            .post(`/call/${callID}/end`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });

    it('End already terminated call', async () => {
        const res = await agent
            .post(`/call/${callID}/end`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
