import { request } from 'chai';
import app from '../../';

let carerCount = 0;
let apCount = 0;
const agent = request.agent(app);

/**
 * Creates a carer with the given username and returns a login token.
 * @param username Username of new user.
 * @return Promise for details of created user.
 */
export const createCarer = async (
    username: string
): Promise<{ id: number; username: string; token: string }> => {
    // Register as carer
    await agent.post('/users/register').send({
        name: `Test Carer ${carerCount++}`,
        username,
        password: username,
        DOB: '2000-01-01',
        mobileNumber: '0',
        type: 'Carer'
    });

    // Return login token
    const res = await agent
        .post('/users/login')
        .send({ username, password: username });
    return {
        id: res.body.id,
        username: res.body.username,
        token: res.body.token
    };
};

/**
 * Creates an AP with the given username and returns a login token.
 * @param username Username of new user.
 * @return Promise for details of created user.
 */
export const createAP = async (
    username: string
): Promise<{ id: number; username: string; token: string }> => {
    // Register as AP
    await agent.post('/users/register').send({
        name: `Test AP ${apCount++}`,
        username,
        password: username,
        DOB: '2000-01-01',
        mobileNumber: '0',
        emergencyContactNumber: '0',
        emergencyContactName: '0',
        type: 'AP'
    });

    // Return login token
    const res = await agent
        .post('/users/login')
        .send({ username, password: username });
    return {
        id: res.body.id,
        username: res.body.username,
        token: res.body.token
    };
};

/**
 * Creates an association between an AP and a carer.
 * @param token1 Auth token of first user.
 * @param token2 Auth token of second user.
 * @return Association information.
 */
export const createAssociation = async (
    token1: string,
    token2: string
): Promise<any> => {
    const token = await agent
        .get('/me/association_token')
        .set('Authorization', `Bearer ${token1}`);
    const association = await agent
        .post('/me/associate')
        .set('Authorization', `Bearer ${token2}`)
        .send({ token: token.body.token });
    return association.body;
};
