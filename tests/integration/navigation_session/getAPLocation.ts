import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import { createNavigationSession } from '../helpers/navigation';

describe('Navigation session', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('nav_get_location_carer')).token;
        APToken = (await createAP('nav_get_location_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Get AP location', async () => {
        const location = {
            lat: 1.23,
            lon: 4.56
        };

        // Update AP location
        const r = await agent
            .post(`/navigation/${navSessionID}/location`)
            .send(location)
            .set('Authorization', 'Bearer ' + APToken);
        expect(r).to.be.json;
        expect(r).to.have.status(200);
        expect(r.body).to.have.property('status');
        expect(r.body.status).to.equal('success');

        // Get updated location
        const res = await agent
            .get(`/navigation/${navSessionID}/location`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('lat');
        expect(res.body).to.have.property('lon');
        expect(res.body.lat).to.equal(location.lat);
        expect(res.body.lon).to.equal(location.lon);
    });
});
