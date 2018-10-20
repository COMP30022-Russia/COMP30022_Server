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
    let callID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_nav_carer')).token;
        apToken = (await createAP('nav_call_nav_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            apToken,
            association.id
        );
        navSessionID = navSession.id;

        // Create call and terminate call
        const callInitial = await startNavigationCall(carerToken, navSessionID);
        const callInitialID = callInitial.id;
        await agent
            .post(`/calls/${callInitialID}/end`)
            .set('Authorization', `Bearer ${apToken}`);
        // Create call again
        const call = await startNavigationCall(apToken, navSessionID);
        callID = call.id;
    });

    it('Get call through navigation', async () => {
        const res = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('Call');
        expect(res.body.Call).to.have.property('id');
        expect(res.body.Call.id).to.equal(callID);
        expect(res.body.Call.state).to.equal('Pending');
    });

    it('Get call through /me', async () => {
        // Get as carer
        const res1 = await agent
            .get(`/me/navigation`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('Call');
        expect(res1.body.Call).to.have.property('id');
        expect(res1.body.Call.id).to.equal(callID);
        expect(res1.body.Call.state).to.equal('Pending');

        // Get as AP
        const res2 = await agent
            .get(`/me/navigation`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('Call');
        expect(res2.body.Call).to.have.property('id');
        expect(res2.body.Call.id).to.equal(callID);
        expect(res2.body.Call.state).to.equal('Pending');
    });

    it('End call through navigation', async () => {
        // End navigation session
        await agent
            .post(`/navigation/${navSessionID}/end`)
            .set('Authorization', `Bearer ${carerToken}`);

        // Get call information
        const res = await agent
            .get(`/calls/${callID}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(callID);
        expect(res.body).to.have.property('state');
        expect(res.body.state).to.equal('Terminated');
    });
});
