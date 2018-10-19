import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Emergency', () => {
    const agent = request.agent(app);

    let APID: number;
    let apToken: string;
    let carerToken: string;

    before(async () => {
        // Create AP, carer
        const createdAP = await createAP('emergency_initiate_1');
        apToken = createdAP.token;
        APID = createdAP.id;
        carerToken = (await createCarer('emergency_initiate_2')).token;

        // Create association
        await createAssociation(apToken, carerToken);
    });

    it('Try to create emergency event as carer', async () => {
        const res = await agent
            .post('/me/emergency')
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });

    let firstID: number;
    it('Create emergency event (first time)', async () => {
        const res = await agent
            .post('/me/emergency')
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('APId');
        expect(res.body).to.have.property('handled');
        expect(res.body.APId).to.equal(APID);
        expect(res.body.handled).to.equal(false);
        firstID = res.body.id;
    });

    it('Resend emergency event initiation as same AP', async () => {
        const res = await agent
            .post('/me/emergency')
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('APId');
        expect(res.body).to.have.property('handled');
        expect(res.body.APId).to.equal(APID);
        expect(res.body.handled).to.equal(false);
        expect(res.body.id).to.equal(firstID);
    });
});
