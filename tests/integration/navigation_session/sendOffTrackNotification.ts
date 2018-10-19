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
        carerToken = (await createCarer('nav_off_track_carer')).token;
        apToken = (await createAP('nav_off_track_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            apToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Send off track notification', async () => {
        const res = await agent
            .post(`/navigation/${navSessionID}/off_track`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });
});
