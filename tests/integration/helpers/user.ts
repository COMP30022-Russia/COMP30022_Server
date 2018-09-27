import { request } from 'chai';
import app from '../../';

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

/**
 * Creates an association between an AP and a carer.
 * @param {string} token1 Auth token of first user.
 * @param {string} token2 Auth token of second user.
 * @returns {any} Association information.
 */
export const createAssociation = async (
    token1: string,
    token2: string
): Promise<any> => {
    const token = await agent
        .get('/me/association_token')
        .set('Authorization', 'Bearer ' + token1);
    const association = await agent
        .post('/me/associate')
        .set('Authorization', 'Bearer ' + token2)
        .send({ token: token.body.token });
    return association.body;
};
