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
        carerToken = await createCarer('nav_update_location_carer');
        APToken = await createAP('nav_update_location_ap');
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('Update location as AP - twice', async () => {
        const res = await agent
            .post(`/navigation/${navSessionID}/location`)
            .send({ lat: 1.23, lon: 4.56 })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        const res2 = await agent
            .post(`/navigation/${navSessionID}/location`)
            .send({ lat: 1.22, lon: 4.36 })
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('status');
        expect(res2.body.status).to.equal('success');
    });

    it('Update location as carer - invalid', async () => {
        const res = await agent
            .post(`/navigation/${navSessionID}/location`)
            .send({ lat: 1.23, lon: 4.56 })
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
