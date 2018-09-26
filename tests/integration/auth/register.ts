import { expect, request } from 'chai';
import app from '../../';

describe('User register', () => {
    const agent = request.agent(app);

    it('Register as Carer', async () => {
        const user = {
            name: 'Person 1',
            username: 'p1',
            password: 'p1',
            DOB: '1997-08-25',
            mobileNumber: '0',
            type: 'Carer'
        };

        const res = await agent.post('/users/register').send(user);
        expect(res).to.be.json;
        expect(res).to.have.status(200);

        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('username');
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.have.property('DOB');
        expect(res.body).to.have.property('mobileNumber');
        expect(res.body).to.have.property('type');

        expect(res.body.name).to.equal(user.name);
        expect(res.body.username).to.equal(user.username);
        expect(res.body.DOB).to.equal(user.DOB);
        expect(res.body.mobileNumber).to.equal(user.mobileNumber);
        expect(res.body.type).to.equal(user.type);
    });

    it('Register as AP', async () => {
        const user = {
            name: 'AP 1',
            username: 'a1',
            password: 'a1',
            DOB: '1950-08-25',
            mobileNumber: '0',
            type: 'AP',
            emergencyContactName: 'Person 1',
            emergencyContactNumber: '1',
            address: '1 Flinders Street, East Melbourne'
        };

        const res = await agent.post('/users/register').send(user);
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
        expect(res.body).to.have.property('address');

        expect(res.body.name).to.equal(user.name);
        expect(res.body.username).to.equal(user.username);
        expect(res.body.DOB).to.equal(user.DOB);
        expect(res.body.mobileNumber).to.equal(user.mobileNumber);
        expect(res.body.type).to.equal(user.type);
        expect(res.body.emergencyContactName).to.equal(
            user.emergencyContactName
        );
        expect(res.body.emergencyContactNumber).to.equal(
            user.emergencyContactNumber
        );
        expect(res.body.address).to.equal(user.address);
    });

    it('Register as AP without emergency details', async () => {
        const res = await agent.post('/users/register').send({
            name: 'AP 1',
            username: 'ap_no_emergency',
            password: 'a1',
            DOB: '1950-08-25',
            mobileNumber: '0',
            type: 'AP',
            emergencyContactNumber: '1'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(422);
    });

    it('Register as AP without address', async () => {
        const res = await agent.post('/users/register').send({
            name: 'AP 1',
            username: 'ap_no_address',
            password: 'a1',
            DOB: '1950-08-25',
            mobileNumber: '0',
            type: 'AP',
            emergencyContactName: 'Person 1',
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
            DOB: '1950-08-25',
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
            DOB: '1950-08-25',
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
            DOB: '1950-08-25',
            type: 'Carer',
            mobileNumber: '0'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(422);
    });
});
