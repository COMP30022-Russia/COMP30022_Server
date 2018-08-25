import { expect, request } from 'chai';
import app from './';

describe('User', () => {
    const agent = request.agent(app);

    it('Register as Carer', async () => {
        const res = await agent.post('/users/register').send({
            name: 'Person 1',
            username: 'p1',
            password: 'p1',
            DOB: '1997-08-25',
            mobileNumber: '0',
            type: 'Carer'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(200);

        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('username');
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.have.property('DOB');
        expect(res.body).to.have.property('mobileNumber');
        expect(res.body).to.have.property('type');

        expect(res.body.name).to.equal('Person 1');
        expect(res.body.username).to.equal('p1');
        expect(res.body.DOB).to.equal('1997-08-25');
        expect(res.body.mobileNumber).to.equal('0');
        expect(res.body.type).to.equal('Carer');
    });

    it('Register as AP', async () => {
        const res = await agent.post('/users/register').send({
            name: 'AP 1',
            username: 'a1',
            password: 'a1',
            DOB: '1950-08-25',
            mobileNumber: '0',
            type: 'AP',
            emergencyContactName: 'Person 1',
            emergencyContactNumber: '1'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(200);

        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('username');
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.have.property('DOB');
        expect(res.body).to.have.property('mobileNumber');
        expect(res.body).to.have.property('type');
        expect(res.body).to.have.property('emergencyContactName');
        expect(res.body).to.have.property('emergencyContactNumber');

        expect(res.body.name).to.equal('AP 1');
        expect(res.body.username).to.equal('a1');
        expect(res.body.DOB).to.equal('1950-08-25');
        expect(res.body.mobileNumber).to.equal('0');
        expect(res.body.type).to.equal('AP');
        expect(res.body.emergencyContactName).to.equal('Person 1');
        expect(res.body.emergencyContactNumber).to.equal('1');
    });

    it('Register as AP without emergency details', async () => {
        const res = await agent.post('/users/register').send({
            name: 'AP 1',
            username: 'a1',
            password: 'a1',
            age: 70,
            mobileNumber: '0',
            type: 'AP',
            emergencyContactNumber: '1'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(422);
    });

    it('Register as Carer with missing details', async () => {
        const res = await agent.post('/users/register').send({
            name: 'Carer 1',
            username: 'c1',
            password: 'c1',
            age: 25,
            type: 'Carer'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(422);
    });

    it('Register as Carer with additional invalid field', async () => {
        const res = await agent.post('/users/register').send({
            name: 'Carer 1',
            username: 'c1',
            password: 'c1',
            age: 25,
            type: 'Carer',
            mobileNumber: '0',
            foo: 'bar'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res).to.not.have.property('foo');
    });

    it('Register as Carer with no password', async () => {
        const res = await agent.post('/users/register').send({
            name: 'Carer 1',
            username: 'c2',
            age: 25,
            type: 'Carer',
            mobileNumber: '0'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(422);
    });

    it('User login', async () => {
        const res = await agent.post('/users/login').send({
            username: 'p1',
            password: 'p1'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(200);

        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('username');
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.have.property('DOB');
        expect(res.body).to.have.property('mobileNumber');
        expect(res.body).to.have.property('type');

        expect(res.body.name).to.equal('Person 1');
        expect(res.body.username).to.equal('p1');
        expect(res.body.DOB).to.equal('1997-08-25');
        expect(res.body.mobileNumber).to.equal('0');
        expect(res.body.type).to.equal('Carer');
    });

    it('Unsuccessful user login - wrong password', async () => {
        const res = await agent.post('/users/login').send({
            username: 'p1',
            password: 'p2'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(401);
    });

    it('Unsuccessful user login - missing username', async () => {
        const res1 = await agent.post('/users/login').send({
            username: '',
            password: 'p1'
        });
        expect(res1).to.be.json;
        expect(res1).to.have.status(401);

        const res2 = await agent.post('/users/login').send({
            password: 'p1'
        });
        expect(res2).to.be.json;
        expect(res2).to.have.status(401);
    });

    it('Unsuccessful user login - non existant user', async () => {
        const res = await agent.post('/users/login').send({
            username: 'p0',
            password: 'p1'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(401);
    });
});
