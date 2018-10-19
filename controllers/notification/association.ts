import { buildDataMessage, sendMessage } from './';

/**
 * Builds and sends an association message.
 * @param currentUserName Name of current user.
 * @param targetID ID of target.
 */
export const sendAssociationMessage = async (targetID: number) => {
    const message = buildDataMessage('association', {});
    await sendMessage(message, targetID);
};
