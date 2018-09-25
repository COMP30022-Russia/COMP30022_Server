import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../../helpers/user';
import { createNavigationSession } from '../../helpers/navigation';

describe('Navigation session', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = await createCarer('nav_control_carer');
        APToken = await createAP('nav_control_ap');
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Switch control', async () => {
        const r = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(r).to.be.json;
        expect(r).to.have.status(200);
        expect(r.body).to.have.property('carerHasControl');
        const carerHasControl = r.body.carerHasControl;

        // First, flip control as carer
        const res = await agent
            .post(`/navigation/${navSessionID}/control`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('carerHasControl');
        expect(res.body.carerHasControl).to.equal(!carerHasControl);

        // Then, flip control as AP, expect control to be flipped again
        const res2 = await agent
            .post(`/navigation/${navSessionID}/control`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('carerHasControl');
        expect(res2.body.carerHasControl).to.equal(carerHasControl);
    });
});
