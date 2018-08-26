import { request } from 'chai';
import app from '../';

let carer_count = 0,
    AP_count = 0;
const agent = request.agent(app);

/**
 * Creates a carer with the given username and returns a login token.
 * @param {string} username Username of new user.
 * @return {Promise} Promise for login token of created user.
 */
export const createCarer = async (username: string): Promise<string> => {
    // Register as carer
    await agent.post('/users/register').send({
        name: 'Test Carer ' + carer_count++,
        username: username,
        password: username,
        DOB: '2000-01-01',
        mobileNumber: '0',
        type: 'Carer'
    });

    // Return login token
    const res = await agent
        .post('/users/login')
        .send({ username: username, password: username });
    return res.body.token;
};

/**
 * Creates an AP with the given username and returns a login token.
 * @param {string} username Username of new user.
 * @return {Promise} Promise for login token of created user.
 */
export const createAP = async (username: string): Promise<string> => {
    // Register as AP
    await agent.post('/users/register').send({
        name: 'Test AP ' + AP_count++,
        username: username,
        password: username,
        DOB: '2000-01-01',
        mobileNumber: '0',
        address: 'A',
        emergencyContactNumber: '0',
        emergencyContactName: '0',
        type: 'AP'
    });

    // Return login token
    const res = await agent
        .post('/users/login')
        .send({ username: username, password: username });
    return res.body.token;
};
