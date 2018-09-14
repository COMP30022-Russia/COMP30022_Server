import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer } from '../../helpers/user';

describe('Association', () => {
    const agent = request.agent(app);
    let carer1Token: string;
    let carer2Token: string;
    let AP1Token: string;
    let AP2Token: string;

    before(async () => {
        // Register as carers/APs and get login token
        carer1Token = await createCarer('atc1');
        carer2Token = await createCarer('atc2');
        AP1Token = await createAP('ata1');
        AP2Token = await createAP('ata2');
    });

    // Test user authentication via JWT token in header
    it('Get association token without login token in Authorization header', async () => {
        const res = await agent.get('/me/association_token');
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal(
            'Authorization header missing or incorrect'
        );
    });
    it('Get association token with wrong login token in Authorization header', async () => {
        const res = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + carer1Token.slice(0, -1));
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Token could not be verified');
    });

    it('Get association token', async () => {
        const res = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + carer1Token);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
    });

    it('Try to create association between accounts of same type', async () => {
        // Try to create carer/carer association
        // First, get the association token of a carer
        const carer_token = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + carer1Token);
        // Then, try to get the other carer to associate with the first carer
        const associationRes1 = await agent
            .post('/me/associate')
            .set('Authorization', 'Bearer ' + carer2Token)
            .send({ token: carer_token.body.token });
        expect(associationRes1).to.be.json;
        expect(associationRes1).to.have.status(400);
        expect(associationRes1.body.message).to.equal(
            'Accounts of the same type cannot be associated'
        );

        // Try to create AP/AP association
        const AP_token = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + AP1Token);
        const associationRes2 = await agent
            .post('/me/associate')
            .set('Authorization', 'Bearer ' + AP2Token)
            .send({ token: AP_token.body.token });
        expect(associationRes2).to.be.json;
        expect(associationRes2).to.have.status(400);
        expect(associationRes2.body.message).to.equal(
            'Accounts of the same type cannot be associated'
        );
    });

    it('Create association - AP -> Carer', async () => {
        // Get association token of AP
        const token = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + AP1Token);

        // Get carer1 to initiate association request
        const res = await agent
            .post('/me/associate')
            .set('Authorization', 'Bearer ' + carer1Token)
            .send({ token: token.body.token });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res).to.have.property('status');
        expect(res.body).to.have.property('id');

        // Get carer2 to initiate association request
        const res2 = await agent
            .post('/me/associate')
            .set('Authorization', 'Bearer ' + carer2Token)
            .send({ token: token.body.token });
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2).to.have.property('status');
        expect(res2.body).to.have.property('id');
    });

    it('Create association - Carer -> AP', async () => {
        // Get association token of carer
        const token = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + carer1Token);

        // Get AP2 to initiate association request
        const res = await agent
            .post('/me/associate')
            .set('Authorization', 'Bearer ' + AP2Token)
            .send({ token: token.body.token });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res).to.have.property('status');
        expect(res.body).to.have.property('id');
    });

    it('Create association - Invalid duplicate association', async () => {
        // Get association token of carer
        const token = await agent
            .get('/me/association_token')
            .set('Authorization', 'Bearer ' + carer1Token);

        // Get AP2 to initiate association request
        const res = await agent
            .post('/me/associate')
            .set('Authorization', 'Bearer ' + AP2Token)
            .send({ token: token.body.token });
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('An association already exists');
    });

    it('Get associations', async () => {
        // Get associations of Carer 1, Carer 1 should be associated with
        // AP 1 and AP 2
        const res = await agent
            .get('/me/associations')
            .set('Authorization', 'Bearer ' + carer1Token);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.lengthOf(2);
        // Ensure that 2 different associations are returned
        expect(res.body[0].id).to.not.equal(res.body[1].id);
        expect([
            res.body[0].user.username,
            res.body[1].user.username
        ]).to.have.members(['ata1', 'ata2']);

        // Get associations of AP 2, AP 2 should be associated with Carer 1
        const res2 = await agent
            .get('/me/associations')
            .set('Authorization', 'Bearer ' + AP2Token);
        expect(res2).to.be.json;
        expect(res2).to.have.status(200);
        expect(res2.body).to.have.lengthOf(1);
        expect(res2.body[0].user.username).to.equal('atc1');
        expect(res2.body[0].user).to.not.have.property('password');
    });

    it('Get specific association', async () => {
        const multiple = await agent
            .get('/me/associations')
            .set('Authorization', 'Bearer ' + AP2Token);
        const associationID = multiple.body[0].id;

        const single = await agent
            .get('/associations/' + associationID)
            .set('Authorization', 'Bearer ' + AP2Token);
        expect(single).to.be.json;
        expect(single).to.have.status(200);
        expect(single.body).to.have.property('user');
        expect(single.body.user).to.not.have.property('password');

        // Ensure that single/multiple matches up
        expect(multiple.body[0]).to.deep.equal(single.body);
    });

    it('Get incorrect association', async () => {
        const res = await agent
            .get('/associations/1')
            .set('Authorization', 'Bearer ' + AP2Token);
        expect(res).to.be.json;
        expect(res).to.have.status(400);

        const res2 = await agent
            .get('/associations/a')
            .set('Authorization', 'Bearer ' + AP2Token);
        expect(res2).to.be.json;
        expect(res2).to.have.status(400);
    });
});
