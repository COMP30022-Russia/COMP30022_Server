import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends an association message.
 * @param {string} senderName Name of sender.
 * @param {string} targetID ID of target.
 * @param {number} associationID ID of association.
 * @param {number} message Message being sent.
 */
export default async (
    senderName: string,
    targetID: number,
    associationID: number,
    message: string
) => {
    const data_payload = {
        associationID: String(associationID)
    };
    const notificationMessage = buildAndroidNotificationMessage(
        `New message from ${senderName}`,
        message
    );
    const dataMessage = buildDataMessage('chat', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};
