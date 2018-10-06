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
        carerToken = (await createCarer('nav_call_state_carer')).token;
        APToken = (await createAP('nav_call_state_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const session = await createNavigationSession(APToken, association.id);
        navSessionID = session.id;

        // Create call
        const call = await startNavigationCall(carerToken, navSessionID);
        callID = call.id;

        // Accept call
        const accept = await agent
            .post(`/call/${callID}/accept`)
            .set('Authorization', 'Bearer ' + APToken);
    });

    it('Set state', async () => {
        const newState = 'OngoingCamera';
        const res = await agent
            .post(`/call/${callID}/state`)
            .send({ state: newState })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('state');
        expect(res.body.state).to.equal(newState);
        // Sync of 3 - start, accept, set
        expect(res.body.sync).to.equal(3);
    });

    it('Set state to terminated', async () => {
        const newState = 'Terminated';
        const res = await agent
            .post(`/call/${callID}/state`)
            .send({ state: newState })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Set invalid state', async () => {
        const newState = 'Invalid';
        const res = await agent
            .post(`/call/${callID}/state`)
            .send({ state: newState })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
