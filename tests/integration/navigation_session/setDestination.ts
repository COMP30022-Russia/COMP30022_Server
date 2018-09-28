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
        carerToken = (await createCarer('nav_set_destination_carer')).token;
        APToken = (await createAP('nav_set_destination_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Set destination without placeID', async () => {
        const res = await agent
            .post(`/navigation/${navSessionID}/destination`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Set destination without setting AP location first', async () => {
        const res = await agent
            .post(`/navigation/${navSessionID}/destination`)
            .send({ name: 'A', placeID: 'ChIJSyUHXNRC1moRbf8lt-Jjy-o' })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Set destination', async () => {
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
        const res = await agent
            .post(`/navigation/${navSessionID}/destination`)
            .send({ name: 'A', placeID: 'ChIJSyUHXNRC1moRbf8lt-Jjy-o' })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Check session
        const session = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(session).to.be.json;
        expect(session).to.have.status(200);
        expect(session.body).to.have.property('route');
        expect(session.body).to.have.property('transportMode');
        expect(session.body).to.have.property('state');
        expect(session.body).to.have.property('destinationId');
        expect(session.body.route).to.be.an('object');
        expect(session.body.transportMode).to.equal('Walking');
        expect(session.body.state).to.equal('Started');
    });

    it('Set destination again (Public Transport)', async () => {
        // Set destination
        const res = await agent
            .post(`/navigation/${navSessionID}/destination`)
            .send({
                name: 'A',
                placeID: 'ChIJSyUHXNRC1moRbf8lt-Jjy-o',
                mode: 'PT'
            })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Check session
        const session = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(session).to.be.json;
        expect(session).to.have.status(200);
        expect(session.body).to.have.property('route');
        expect(session.body).to.have.property('transportMode');
        expect(session.body).to.have.property('state');
        expect(session.body).to.have.property('destinationId');
        expect(session.body.route).to.be.an('object');
        expect(session.body.transportMode).to.equal('PT');
        expect(session.body.state).to.equal('Started');
    });
});
