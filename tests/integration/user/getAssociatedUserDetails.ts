import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('User details', () => {
    const agent = request.agent(app);

    let apToken: string;
    let carerToken: string;
    let maliciousCarerToken: string;
    let association: any;

    before(async () => {
        // Create AP, carer and association
        apToken = (await createAP('da1')).token;
        carerToken = (await createCarer('dc1')).token;
        maliciousCarerToken = (await createCarer('dmc1')).token;

        // Create association
        association = await createAssociation(apToken, carerToken);
    });

    // Get AP details when AP does not have a location yet
    it('Get AP profile without location', async () => {
        const res = await agent
            .get(`/users/${association.APId}`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(association.APId);
        expect(res.body).to.have.property('location');
        expect(res.body.location).to.be.null;
    });

    it('Get AP profile with location', async () => {
        // Update AP location
        const location = { lat: 1.23, lon: 9.87 };
        await agent
            .post('/me/location')
            .send(location)
            .set('Authorization', `Bearer ${apToken}`);

        // Expect returned response to have location
        const res = await agent
            .get(`/users/${association.APId}`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(association.APId);
        expect(res.body).to.have.property('location');
        expect(res.body.location).to.have.property('lat');
        expect(res.body.location).to.have.property('lon');
        expect(res.body.location.lat).to.equal(String(location.lat));
        expect(res.body.location.lon).to.equal(String(location.lon));
    });

    it('Get carer profile', async () => {
        const res = await agent
            .get(`/users/${association.carerId}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(association.carerId);
        expect(res.body).to.not.have.property('location');
    });

    // Where the malicious carer is not associated with the target AP
    it('Get AP profile as malicious carer', async () => {
        const res = await agent
            .get(`/users/${association.APId}`)
            .set('Authorization', `Bearer ${maliciousCarerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(403);
    });
});
