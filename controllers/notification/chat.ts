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
    const data_payload = { associationID };
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
 * @param {number} pictureID ID of picture.
 */
export const sendChatPictureUploadMessage = async (
    targetID: number,
    associationID: number,
    pictureID: number
) => {
    const data_payload = { associationID, pictureID };
    const dataMessage = buildDataMessage('chat_picture_uploaded', data_payload);
    await sendMessage(dataMessage, targetID);
};
