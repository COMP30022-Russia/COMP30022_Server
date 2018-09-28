import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';
import { createNavigationSession } from '../helpers/navigation';

describe('Destination', () => {
    const agent = request.agent(app);

    // Tokens/IDs
    let carerToken: string;
    let APToken: string;
    let carerID, APID: number;
    let navSessionID: number;
    let destinationID: number;

    // Define arbitary destination
    const DEST: { [name: string]: string; placeID: string } = {
        name: 'A',
        placeID: 'ChIJSyUHXNRC1moRbf8lt-Jjy-o'
    };

    before(async () => {
        // Register as carers/APs and get login token
        const carer = await createCarer('destination_fav_carer');
        const AP = await createAP('destination_fav_ap');
        APToken = AP.token;
        carerToken = carer.token;
        carerID = carer.id;
        APID = AP.id;

        // Associate AP with carer
        const association = await createAssociation(carerToken, APToken);
        // Create navigation session for association
        const navSession = await createNavigationSession(
            APToken,
            association.id
        );
        navSessionID = navSession.id;

        // Set location as AP
        await agent
            .post(`/navigation/${navSessionID}/location`)
            .send({ lat: 1.23, lon: 4.56 })
            .set('Authorization', 'Bearer ' + APToken);

        // Set destination as AP
        await agent
            .post(`/navigation/${navSessionID}/destination`)
            .send(DEST)
            .set('Authorization', 'Bearer ' + APToken);
    });

    it('Get destinations', async () => {
        const res = await agent
            .get(`/users/${APID}/destination`)
            .set('Authorization', 'Bearer ' + APToken);
        destinationID = res.body.recents[0].id;
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('recents');
        expect(res.body).to.have.property('favourites');
        expect(res.body.favourites).to.have.lengthOf(0);
        expect(res.body.recents).to.have.lengthOf(1);
        for (const key of Object.keys(DEST)) {
            expect(res.body.recents[0]).to.have.property(key);
            expect(res.body.recents[0][key]).to.equal(DEST[key]);
        }
    });

    it('Favourite bad destination', async () => {
        const res = await agent
            .post(`/users/${APID}/destination/5000`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(404);
    });

    it('Favourite destination and check favourites', async () => {
        const res = await agent
            .post(`/users/${APID}/destination/${destinationID}`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        const res2 = await agent
            .get(`/users/${APID}/destination`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('recents');
        expect(res2.body).to.have.property('favourites');
        expect(res2.body.favourites).to.have.lengthOf(1);
        expect(res2.body.recents).to.have.lengthOf(1);
        for (const key of Object.keys(DEST)) {
            expect(res2.body.recents[0]).to.have.property(key);
            expect(res2.body.recents[0][key]).to.equal(DEST[key]);
            expect(res2.body.favourites[0]).to.have.property(key);
            expect(res2.body.favourites[0][key]).to.equal(DEST[key]);
        }
    });

    it('Unset favourite destination and check', async () => {
        const res = await agent
            .post(`/users/${APID}/destination/${destinationID}?favourite=false`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal('success');

        const res2 = await agent
            .get(`/users/${APID}/destination`)
            .set('Authorization', 'Bearer ' + APToken);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.property('recents');
        expect(res2.body).to.have.property('favourites');
        expect(res2.body.favourites).to.have.lengthOf(0);
        expect(res2.body.recents).to.have.lengthOf(1);
    });
});
