import { buildDataMessage, sendMessage } from './';

/**
 * Builds and sends an association message.
 * @param {string} currentUserName Name of current user.
 * @param {number} targetID ID of target.
 */
export default async (targetID: number) => {
    const message = buildDataMessage('association', {});
    await sendMessage(message, targetID);
};
