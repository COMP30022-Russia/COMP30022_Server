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
        carerToken = (await createCarer('nav_call_get_carer')).token;
        apToken = (await createAP('nav_call_get_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const session = await createNavigationSession(apToken, association.id);
        navSessionID = session.id;

        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        callID = call.id;
    });

    it('Get call', async () => {
        // Get as AP
        const res1 = await agent
            .get(`/calls/${callID}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('id');
        expect(res1.body).to.have.property('state');
        expect(res1.body).to.have.property('sessionId');
        expect(res1.body).to.have.property('sync');
        expect(res1.body).to.have.property('failureCount');
        expect(res1.body.state).to.equal('Pending');
        expect(res1.body.sessionId).to.equal(navSessionID);
        expect(res1.body.sync).to.equal(1);
        expect(res1.body.failureCount).to.equal(0);

        // Get as carer
        const res2 = await agent
            .get(`/calls/${callID}`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.deep.equal(res1.body);
    });
});
