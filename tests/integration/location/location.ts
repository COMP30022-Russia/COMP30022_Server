import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Location', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let apToken: string;
    let maliciousCarerToken: string;
    let freshAPToken: string;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('lc1')).token;
        apToken = (await createAP('lap1')).token;
        maliciousCarerToken = (await createCarer('lmc1')).token;
        freshAPToken = (await createAP('lap2')).token;

        // Associate AP with carer
        await createAssociation(carerToken, apToken);
    });

    it('Set location as AP', async () => {
        const res = await agent
            .post('/me/location')
            .send({ lat: 1.23, lon: 9.87 })
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');
    });

    it('Try to set location as carer', async () => {
        const res = await agent
            .post('/me/location')
            .send({ lat: 1.23, lon: 9.87 })
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Get AP location', async () => {
        // Arbitrarily define a location
        const newLocation = { lat: 3.45, lon: 2.43 };

        // Make query to update location as AP
        const updateQueryRes = await agent
            .post('/me/location')
            .send(newLocation)
            .set('Authorization', `Bearer ${apToken}`);
        expect(updateQueryRes).to.be.json;
        expect(updateQueryRes).to.have.status(200);
        expect(updateQueryRes.body).to.have.property('status');
        expect(updateQueryRes.body.status).to.equal('success');

        // Perform get query to get location which was set
        // Note: Sequelize returns numeric types as strings
        const getQueryRes = await agent
            .get('/me/location')
            .set('Authorization', `Bearer ${apToken}`);
        expect(getQueryRes).to.be.json;
        expect(getQueryRes).to.have.status(200);
        expect(getQueryRes.body).to.have.property('lon');
        expect(getQueryRes.body).to.have.property('lat');
        expect(getQueryRes.body.lon).to.equal(String(newLocation.lon));
        expect(getQueryRes.body.lat).to.equal(String(newLocation.lat));
    });

    it('Get location of AP who has not submitted a location', async () => {
        const res = await agent
            .get('/me/location')
            .set('Authorization', `Bearer ${freshAPToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    it('Get location of AP as carer', async () => {
        // First, get associations of carer
        const associations = await agent
            .get('/me/associations')
            .set('Authorization', `Bearer ${carerToken}`);
        const associatedAPID = associations.body[0].APId;

        // Arbitrarily define a new location
        const newLocation = { lat: 101.3, lon: 91.2 };
        // Make query to update location of AP again
        await agent
            .post('/me/location')
            .send(newLocation)
            .set('Authorization', `Bearer ${apToken}`);

        // As carer, get location of AP
        const res = await agent
            .get(`/users/${associatedAPID}/location`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('lon');
        expect(res.body).to.have.property('lat');
        expect(res.body.lon).to.equal(String(newLocation.lon));
        expect(res.body.lat).to.equal(String(newLocation.lat));
    });

    it('Try to get location of AP as carer who is not associated with AP', async () => {
        // First, get the ID of the AP
        // (we assume that the malicious carer has gained it somehow)
        const associations = await agent
            .get('/me/associations')
            .set('Authorization', `Bearer ${carerToken}`);
        const associatedAPID = associations.body[0].APId;

        // As malicious carer, try to get location of AP
        const res = await agent
            .get(`/users/${associatedAPID}/location`)
            .set('Authorization', `Bearer ${maliciousCarerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.message).to.equal('User is not party of association');
    });
});
