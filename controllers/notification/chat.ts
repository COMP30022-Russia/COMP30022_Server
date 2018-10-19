import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends a chat notification message.
 * @param senderName Name of sender.
 * @param targetID ID of target.
 * @param associationID ID of association.
 * @param message Message being sent.
 */
export const sendChatMessage = async (
    senderName: string,
    targetID: number,
    associationID: number,
    message: string
) => {
    const dataPayload = { associationID };
    const notificationMessage = buildAndroidNotificationMessage(
        `New message from ${senderName}`,
        message
    );
    const dataMessage = buildDataMessage('chat', dataPayload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};

/**
 * Builds and sends a chat picture uploaded notification message.
 * @param targetID ID of target.
 * @param associationID ID of association.
 * @param pictureID ID of picture.
 */
export const sendChatPictureUploadMessage = async (
    targetID: number,
    associationID: number,
    pictureID: number
) => {
    const dataPayload = { associationID, pictureID };
    const dataMessage = buildDataMessage('chat_picture_uploaded', dataPayload);
    await sendMessage(dataMessage, targetID);
};
