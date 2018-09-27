import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import { createNavigationSession } from '../helpers/navigation';

describe('Navigation session', () => {
    const agent = request.agent(app);

    // Tokens
    let carerToken: string;
    let APToken: string;
    let extraCarerToken: string;
    let navSessionID: number;

    before(async () => {
        // Register as carers/APs and get login token
        carerToken = await createCarer('navgetself_carer');
        APToken = await createAP('navgetself_ap');
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;

        // Create extra token
        extraCarerToken = await createCarer('navgetself_carer_extra');
    });

    it('Get self navigation session as carer', async () => {
        const res = await agent
            .get(`/me/navigation`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(navSessionID);
    });

    it('Get self navigation session as AP', async () => {
        const res = await agent
            .get(`/me/navigation`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        expect(res.body.id).to.equal(navSessionID);
    });

    it('Get self navigation session as user without session', async () => {
        const res = await agent
            .get(`/me/navigation`)
            .set('Authorization', 'Bearer ' + extraCarerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({});
    });
});
