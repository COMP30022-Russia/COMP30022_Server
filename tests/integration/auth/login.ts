import { expect, request } from 'chai';
import app from '../../';

describe('Auth', () => {
    const agent = request.agent(app);

    // Define test user
    const user = {
        name: 'Person 1',
        username: 'r1',
        password: 'r1',
        DOB: '1997-08-25',
        mobileNumber: '0',
        type: 'Carer'
    };

    // Register a user
    before(async () => {
        await agent.post('/users/register').send(user);
    });

    it('Login', async () => {
        const res = await agent.post('/users/login').send({
            username: user.username,
            password: user.password
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

        expect(res.body.name).to.equal(user.name);
        expect(res.body.username).to.equal(user.username);
        expect(res.body.DOB).to.equal(user.DOB);
        expect(res.body.mobileNumber).to.equal(user.mobileNumber);
        expect(res.body.type).to.equal(user.type);
    });

    it('Login with capitalised username', async () => {
        const res = await agent.post('/users/login').send({
            username: user.username.toUpperCase(),
            password: user.password
        });
        expect(res).to.be.json;
        expect(res).to.have.status(200);
    });

    it('Unsuccessful user login - wrong password', async () => {
        const res = await agent.post('/users/login').send({
            username: user.username,
            password: 'bad_password'
        });
        expect(res).to.be.json;
        expect(res).to.have.status(401);
    });

    it('Unsuccessful user login - missing username', async () => {
        const res1 = await agent.post('/users/login').send({
            username: '',
            password: user.password
        });
        expect(res1).to.be.json;
        expect(res1).to.have.status(401);

        const res2 = await agent.post('/users/login').send({
            password: user.password
        });
        expect(res2).to.be.json;
        expect(res2).to.have.status(401);
    });

    it('Unsuccessful user login - non existant user', async () => {
        const res = await agent.post('/users/login').send({
            username: 'bad_user',
            password: user.password
        });
        expect(res).to.be.json;
        expect(res).to.have.status(401);
    });
});
