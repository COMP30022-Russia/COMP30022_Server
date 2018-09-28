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
        carerToken = (await createCarer('nav_end_carer')).token;
        APToken = (await createAP('nav_end_ap')).token;
        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;
    });

    it('End navigation session', async () => {
        // First end session, expect { status: 'success' }
        const res = await agent
            .post(`/navigation/${navSessionID}/end`)
            .set('Authorization', 'Bearer ' + carerToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        // Then query for session to check status
        const res2 = await agent
            .get(`/navigation/${navSessionID}`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('active');
        expect(res2.body.active).to.equal(false);
    });

    it('Try to end already ended navigation session', async () => {
        // First end session, expect { status: 'success' }
        const res = await agent
            .post(`/navigation/${navSessionID}/end`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(400);
    });
});
