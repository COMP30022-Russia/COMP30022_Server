import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Emergency - initiate event', () => {
    const agent = request.agent(app);

    let APToken: string, carerToken: string;
    let maliciousAPToken: string, maliciousCarerToken: string;
    let eventID: number;

    before(async () => {
        // Create AP, carer
        APToken = (await createAP('emergency_get_1')).token;
        carerToken = (await createCarer('emergency_get_2')).token;

        // Create some malicious users
        maliciousAPToken = (await createAP('emergency_get_3')).token;
        maliciousCarerToken = (await createCarer('emergency_get_2')).token;

        // Create association
        await createAssociation(APToken, carerToken);

        // Create event
        const event = await agent
            .post('/me/emergency')
            .set('Authorization', 'Bearer ' + APToken);
        eventID = event.body.id;
    });

    it('Get event as AP/Carer', async () => {
        const res = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('handled');
        expect(res.body).to.have.property('APId');

        const res2 = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('id');
        expect(res2.body).to.have.property('handled');
        expect(res2.body).to.have.property('APId');
        expect(res2.body).to.deep.equal(res.body);
    });

    it('Get invalid event', async () => {
        const res = await agent
            .get(`/emergency/1000`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(404);
    });

    it('Access as malicious users', async () => {
        const res = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', 'Bearer ' + maliciousAPToken);
        expect(res).to.be.json;
        expect(res).to.have.status(403);

        const res2 = await agent
            .get(`/emergency/${eventID}`)
            .set('Authorization', 'Bearer ' + maliciousAPToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(403);
    });
});
