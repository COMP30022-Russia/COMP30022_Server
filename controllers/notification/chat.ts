import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';
import models from '../../models';

/**
 * Builds and sends an association message.
 * @param {string} senderID ID of sender.
 * @param {string} targetID ID of target.
 * @param {number} associationID ID of association.
 * @param {number} message Message being sent.
 */
export default async (
    senderID: number,
    senderName: string,
    targetID: number,
    associationID: number,
    message: string
) => {
    const data_payload = {
        type: 'chat',
        associationID: String(associationID)
    };
    const notificationMessage = buildAndroidNotificationMessage(
        `New message from ${senderName}`,
        message
    );
    const dataMessage = buildDataMessage('chat', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};
