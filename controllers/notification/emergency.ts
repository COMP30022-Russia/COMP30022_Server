import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends an emergency data and notification message.
 * @param eventID ID of emergency event.
 * @param senderID ID of sender.
 * @param senderName Name of sender.
 * @param mobileNumber Mobile number of sender.
 * @param targetIDs ID of targets.
 */
export const sendEmergencyMessage = async (
    eventID: number,
    senderID: number,
    senderName: string,
    mobileNumber: string,
    targetIDs: [number]
) => {
    const dataPayload = { eventID, senderID, mobileNumber, senderName };
    const notificationMessage = buildAndroidNotificationMessage(
        `Emergency event`,
        `${senderName} has raised an emergency`
    );
    const dataMessage = buildDataMessage('emergency_started', dataPayload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetIDs);
};

/**
 * Sends an emergency event handled message.
 * @param eventID ID of emergency event.
 * @param targetIDs ID of targets.
 */
export const sendEmergencyHandledMessage = async (
    eventID: number,
    targetIDs: [number]
) => {
    const dataPayload = { eventID };
    const notificationMessage = buildAndroidNotificationMessage(
        `Emergency handled`,
        `Emergency event has been handled`
    );
    const dataMessage = buildDataMessage('emergency_handled', dataPayload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetIDs);
};
