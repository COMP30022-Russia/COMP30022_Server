import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import { createNavigationSession } from '../helpers/navigation';

describe('Navigation session', () => {
    const agent = request.agent(app);

    let carerToken: string;
    let apToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_control_carer')).token;
        apToken = (await createAP('nav_control_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            apToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Switch control', async () => {
        // Initially, carer doesn't have control (as session is created by AP)
        const carerHasControl = false;

        // First, flip control as carer
        const res1 = await agent
            .post(`/navigation/${navSessionID}/control`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('id');
        expect(res1.body).to.have.property('carerHasControl');
        expect(res1.body.carerHasControl).to.equal(!carerHasControl);

        // Then, flip control as AP, expect control to be flipped again
        const res2 = await agent
            .post(`/navigation/${navSessionID}/control`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('carerHasControl');
        expect(res2.body.carerHasControl).to.equal(carerHasControl);
    });
});
