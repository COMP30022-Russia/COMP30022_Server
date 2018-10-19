import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

describe('Navigation session', () => {
    const agent = request.agent(app);

    let carerToken: string;
    let apToken: string;
    let associationID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = (await createCarer('navstart_carer')).token;
        apToken = (await createAP('navstart_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, apToken);
        associationID = association.id;
    });

    it('Start navigation session', async () => {
        const res = await agent
            .post(`/associations/${associationID}/navigation`)
            .set('Authorization', `Bearer ${carerToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('active');
        expect(res.body).to.have.property('state');
        expect(res.body).to.have.property('carerId');
        expect(res.body).to.have.property('APId');
        expect(res.body).to.have.property('carerHasControl');
        expect(res.body.active).to.equal(true);
        expect(res.body.state).to.equal('Searching');
        expect(res.body.carerHasControl).to.equal(true);
    });

    it('Try to start navigation session again', async () => {
        // Try to start another session as AP
        const res1 = await agent
            .post(`/associations/${associationID}/navigation`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res1).to.be.json;
        expect(res1).to.have.status(400);

        // Try to start another session as carer
        const res2 = await agent
            .post(`/associations/${associationID}/navigation`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res2).to.be.json;
        expect(res2).to.have.status(400);
    });
});
