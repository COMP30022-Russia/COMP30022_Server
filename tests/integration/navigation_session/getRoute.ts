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
        carerToken = await createCarer('nav_get_route_carer');
        APToken = await createAP('nav_get_route_ap');
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Get empty route', async () => {
        const res = await agent
            .get(`/navigation/${navSessionID}/route`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({});
    });

    it('Get route', async () => {
        // Set location
        const location = {
            lat: -37.8033731,
            lon: 144.9620285
        };
        await agent
            .post(`/navigation/${navSessionID}/location`)
            .send(location)
            .set('Authorization', 'Bearer ' + APToken);

        // Set destination
        await agent
            .post(`/navigation/${navSessionID}/destination`)
            .send({ name: 'A', placeID: 'ChIJSyUHXNRC1moRbf8lt-Jjy-o' })
            .set('Authorization', 'Bearer ' + APToken);

        const res = await agent
            .get(`/navigation/${navSessionID}/route`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isWalking');
        expect(res.body).to.have.property('placeID');
        expect(res.body).to.have.property('start');
        expect(res.body.isWalking).to.equal(true);
        expect(res.body.placeID).to.equal('ChIJSyUHXNRC1moRbf8lt-Jjy-o');
        expect(res.body.start).to.deep.equal(location);
    });
});
