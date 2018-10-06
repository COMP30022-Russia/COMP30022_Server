import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Emergency - initiate event', () => {
    const agent = request.agent(app);

    let APToken: string, carerToken: string;
    let carerID: number;
    let eventID: number;

    before(async () => {
        // Create AP, carer
        APToken = (await createAP('emergency_get_1')).token;
        const carer = await createCarer('emergency_get_2');
        carerToken = carer.token;
        carerID = carer.id;

        // Create association
        await createAssociation(APToken, carerToken);

        // Create event
        const event = await agent
            .post('/me/emergency')
            .set('Authorization', 'Bearer ' + APToken);
        eventID = event.body.id;
    });

    it('Handle event as carer', async () => {
        const res = await agent
            .post(`/emergency/${eventID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('handled');
        expect(res.body).to.have.property('APId');
        expect(res.body).to.have.property('resolverId');
        expect(res.body.handled).to.equal(true);
        expect(res.body.resolverId).to.equal(carerID);
    });

    it('Try to handle handled event', async () => {
        const res = await agent
            .post(`/emergency/${eventID}`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
