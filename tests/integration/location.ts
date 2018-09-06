import { expect, request } from 'chai';
import app from '../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Location', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let maliciousCarerToken: string;
    let freshAPToken: string;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = await createCarer('lc1');
        APToken = await createAP('lap1');
        maliciousCarerToken = await createCarer('lmc1');
        freshAPToken = await createAP('lap2');
        // Associate AP with carer
        await createAssociation(carerToken, APToken);
    });

    it('Set location as type: AP user', async () => {
        const r = await agent
            .post('/me/location')
            .send({ lat: 1.23, lon: 9.87 })
            .set('Authorization', 'Bearer ' + APToken);
        expect(r).to.be.json;
        expect(r).to.have.status(200);
        expect(r.body).to.have.property('status');
        expect(r.body.status).to.equal('success');
    });

    it('Try to set location as type: carer user', async () => {
        const r = await agent
            .post('/me/location')
            .send({ lat: 1.23, lon: 9.87 })
            .set('Authorization', 'Bearer ' + carerToken);
        expect(r).to.be.json;
        expect(r).to.have.status(400);
    });

    it('Get AP location', async () => {
        // Arbitrarily define a location
        const newLocation = { lat: 3.45, lon: 2.43 };

        // Make query to update location as AP
        const updateQuery = await agent
            .post('/me/location')
            .send(newLocation)
            .set('Authorization', 'Bearer ' + APToken);
        expect(updateQuery).to.be.json;
        expect(updateQuery).to.have.status(200);
        expect(updateQuery.body).to.have.property('status');
        expect(updateQuery.body.status).to.equal('success');

        // Perform get query to get location which was set
        // Note: Sequelize returns numeric types as strings
        const getQuery = await agent
            .get('/me/location')
            .set('Authorization', 'Bearer ' + APToken);
        expect(getQuery).to.be.json;
        expect(getQuery).to.have.status(200);
        expect(getQuery.body).to.have.property('location');
        expect(getQuery.body.location).to.have.property('lon');
        expect(getQuery.body.location).to.have.property('lat');
        expect(getQuery.body.location.lon).to.equal(String(newLocation.lon));
        expect(getQuery.body.location.lat).to.equal(String(newLocation.lat));
    });

    it('Get location of AP who has not submitted a location', async () => {
        const res = await agent
            .get('/me/location')
            .set('Authorization', 'Bearer ' + freshAPToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('location');
        expect(res.body.location).to.be.null;
    });

    it('Get location of AP as carer', async () => {
        // First, get associations of carer
        const associations = await agent
            .get('/me/associations')
            .set('Authorization', 'Bearer ' + carerToken);
        const associatedAPID = associations.body[0].APId;

        // Arbitrarily define a location
        const newLocation = { lat: 101.3, lon: 91.2 };
        // Make query to update location of AP again
        const updateQuery = await agent
            .post('/me/location')
            .send(newLocation)
            .set('Authorization', 'Bearer ' + APToken);

        // As carer, get location of AP
        const res = await agent
            .get('/users/' + String(associatedAPID) + '/location')
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('location');
        expect(res.body.location).to.have.property('lon');
        expect(res.body.location).to.have.property('lat');
        expect(res.body.location.lon).to.equal(String(newLocation.lon));
        expect(res.body.location.lat).to.equal(String(newLocation.lat));
    });

    it('Try to get location of AP as carer who is not associated with AP', async () => {
        // First, get the ID of the AP
        // (we assume that the malicious carer has gained it somehow)
        const associations = await agent
            .get('/me/associations')
            .set('Authorization', 'Bearer ' + carerToken);
        const associatedAPID = associations.body[0].APId;

        // As malicious carer, try to get location of AP
        const res = await agent
            .get('/users/' + String(associatedAPID) + '/location')
            .set('Authorization', 'Bearer ' + maliciousCarerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.message).to.equal('User is not party of association');
    });
});
