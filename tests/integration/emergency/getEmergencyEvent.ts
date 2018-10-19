import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Emergency', () => {
    const agent = request.agent(app);

    let apToken: string;
    let carerToken: string;
    let maliciousapToken: string;
    let maliciousCarerToken: string;
    let eventID: number;

    before(async () => {
        // Create AP, carer
        apToken = (await createAP('emergency_get_1')).token;
        carerToken = (await createCarer('emergency_get_2')).token;

        // Create some malicious users
        maliciousapToken = (await createAP('emergency_get_3')).token;
        maliciousCarerToken = (await createCarer('emergency_get_4')).token;

        // Create association
        await createAssociation(apToken, carerToken);

        // Create event
        const event = await agent
            .post('/me/emergency')
            .set('Authorization', `Bearer ${apToken}`);
        eventID = event.body.id;
    });

    it('Get emergency event as AP/Carer', async () => {
        const res1 = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(200);
        expect(res1.body).to.have.property('id');
        expect(res1.body).to.have.property('handled');
        expect(res1.body).to.have.property('APId');

        const res2 = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('handled');
        expect(res2.body).to.have.property('APId');
        expect(res2.body).to.deep.equal(res1.body);
    });

    it('Get invalid emergency event', async () => {
        const res = await agent
            .get(`/emergency/1000`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(404);
    });

    it('Access emergency event as malicious users', async () => {
        const res1 = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', `Bearer ${maliciousCarerToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(403);

        const res2 = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', `Bearer ${maliciousapToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(403);
    });
});
