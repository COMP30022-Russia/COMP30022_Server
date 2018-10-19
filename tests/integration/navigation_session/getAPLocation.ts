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
        carerToken = (await createCarer('nav_get_location_carer')).token;
        apToken = (await createAP('nav_get_location_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            apToken,
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
        const resUpdate = await agent
            .post(`/navigation/${navSessionID}/location`)
            .send(location)
            .set('Authorization', `Bearer ${apToken}`);
        expect(resUpdate).to.be.json;
        expect(resUpdate).to.have.status(200);
        expect(resUpdate.body).to.have.property('status');
        expect(resUpdate.body.status).to.equal('success');

        // Get updated location
        const res = await agent
            .get(`/navigation/${navSessionID}/location`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('lat');
        expect(res.body).to.have.property('lon');
        expect(res.body.lat).to.equal(location.lat);
        expect(res.body.lon).to.equal(location.lon);
    });
});
