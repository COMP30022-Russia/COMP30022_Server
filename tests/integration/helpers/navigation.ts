import { request } from 'chai';
import app from '../../';
const agent = request.agent(app);

/**
 * Creates a navigation session for the given association, initiated by the
 * given user.
 * @param {string} token Token of initiator user.
 * @param {number} associationID Association ID.
 * @return {Promise} Promise for navigation session.
 */
export const createNavigationSession = async (
    token: string,
    associationID: number
): Promise<any> => {
    const res = await agent
        .post(`/associations/${associationID}/navigation`)
        .set('Authorization', 'Bearer ' + token);
    return res.body;
};

/**
 * Starts a navigation call, initiated by the given user.
 * @param {string} token Token of initiator user.
 * @param {number} navSessionID ID of session.
 * @return {Promise} Promise for call.
 */
export const startNavigationCall = async (
    token: string,
    navSessionID: number
): Promise<any> => {
    const res = await agent
        .post(`/navigation/${navSessionID}/call`)
        .set('Authorization', 'Bearer ' + token);
    return res.body;
};
