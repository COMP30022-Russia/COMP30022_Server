import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends a navigation started message.
 * @param {string} senderName Name of sender.
 * @param {string} targetID ID of target.
 * @param {number} associationID ID of association.
 * @param {number} sessionID ID of session.
 */
export const sendNavigationStartMessage = async (
    senderName: string,
    targetID: number,
    associationID: number,
    sessionID: number
) => {
    const data_payload = {
        associationID: associationID,
        sessionID: sessionID
    };
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation session started`,
        `Navigation session has been started by ${senderName}`
    );
    const dataMessage = buildDataMessage('nav_start', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};

/**
 * Builds and sends a navigation ended message.
 * @param {string} targetID ID of target.
 * @param {number} sessionID ID of session.
 */
export const sendNavigationEndMessage = async (
    targetID: number,
    sessionID: number
) => {
    const data_payload = {
        sessionID: sessionID
    };
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation session ended`,
        `Navigation session has been ended`
    );
    const dataMessage = buildDataMessage('nav_end', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};
