import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../../helpers/user';

describe('Navigation session', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let associationID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = await createCarer('navstart_carer');
        APToken = await createAP('navstart_ap');
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        associationID = association.id;
    });

    it('Start navigation session', async () => {
        const r = await agent
            .post(`/associations/${associationID}/navigation`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(r).to.be.json;
        expect(r).to.have.status(200);
        expect(r.body).to.have.property('id');
        expect(r.body).to.have.property('active');
        expect(r.body).to.have.property('state');
        expect(r.body).to.have.property('carerId');
        expect(r.body).to.have.property('APId');
        expect(r.body).to.have.property('carerHasControl');
        expect(r.body.active).to.equal(true);
        expect(r.body.state).to.equal('Searching');
        expect(r.body.carerHasControl).to.equal(true);
    });

    it('Try to start navigation session again', async () => {
        // Try to start another session as AP
        const r1 = await agent
            .post(`/associations/${associationID}/navigation`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(r1).to.be.json;
        expect(r1).to.have.status(400);

        // Try to start another session as carer
        const r2 = await agent
            .post(`/associations/${associationID}/navigation`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(r2).to.be.json;
        expect(r2).to.have.status(400);
    });
});
