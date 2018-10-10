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
    let callID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_call_nav_carer')).token;
        APToken = (await createAP('nav_call_nav_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;

        // Create call and terminate call
        const callInitial = await startNavigationCall(carerToken, navSessionID);
        const callInitialID = callInitial.id;
        await agent
            .post(`/call/${callInitialID}/end`)
            .set('Authorization', 'Bearer ' + APToken);
        // Create call again
        const call = await startNavigationCall(APToken, navSessionID);
        callID = call.id;
    });

    it('Get call through navigation', async () => {
        const res = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('Call');
        expect(res.body.Call).to.have.property('id');
        expect(res.body.Call.id).to.equal(callID);
        expect(res.body.Call.state).to.equal('Pending');
    });

    it('End call through navigation', async () => {
        // End session
        await agent
            .post(`/navigation/${navSessionID}/end`)
            .set('Authorization', 'Bearer ' + carerToken);

        // Get call information
        const res = await agent
            .get(`/call/${callID}`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(callID);
        expect(res.body).to.have.property('state');
        expect(res.body.state).to.equal('Terminated');
    });
});
