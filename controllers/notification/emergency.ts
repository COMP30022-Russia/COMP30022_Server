import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends an emergency message.
 * @param {eventID} eventID ID of emergency event.
 * @param {string} senderID ID of sender.
 * @param {string} senderName Name of sender.
 * @param {[number]} targetIDs ID of targets.
 */
export const sendEmergencyMessage = async (
    eventID: number,
    senderID: number,
    senderName: string,
    targetIDs: [number]
) => {
    const data_payload = {
        eventID,
        senderID,
        senderName
    };
    const notificationMessage = buildAndroidNotificationMessage(
        `Emergency event`,
        `${senderName} has raised an emergency`
    );
    const dataMessage = buildDataMessage('emergency_started', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetIDs);
};

/**
 * Sends an emergency event handled message.
 * @param {eventID} eventID ID of emergency event.
 * @param {[number]} targetIDs ID of targets.
 */
export const sendEmergencyHandledMessage = async (
    eventID: number,
    targetIDs: [number]
) => {
    const data_payload = {
        eventID
    };
    const notificationMessage = buildAndroidNotificationMessage(
        `Emergency handled`,
        `Emergency event has been handled`
    );
    const dataMessage = buildDataMessage('emergency_handled', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetIDs);
};
