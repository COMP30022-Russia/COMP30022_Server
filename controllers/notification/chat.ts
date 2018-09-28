import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends a chat notification message.
 * @param {string} senderName Name of sender.
 * @param {string} targetID ID of target.
 * @param {number} associationID ID of association.
 * @param {number} message Message being sent.
 */
export const sendChatMessage = async (
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

/**
 * Builds and sends a chat picture uploaded notification message.
 * @param {string} targetID ID of target.
 * @param {number} associationID ID of association.
 */
export const sendChatPictureUploadMessage = async (
    targetID: number,
    associationID: number
) => {
    const data_payload = {
        associationID: String(associationID)
    };
    const dataMessage = buildDataMessage('chat_picture_uploaded', data_payload);
    await sendMessage(dataMessage, targetID);
};
