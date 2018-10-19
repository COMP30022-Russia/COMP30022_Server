import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends a navigation started message.
 * @param senderName Name of sender.
 * @param targetID ID of target.
 * @param associationID ID of association.
 * @param sessionID ID of session.
 * @param sync Sync count.
 */
export const sendNavigationStartMessage = async (
    senderName: string,
    targetID: number,
    associationID: number,
    sessionID: number,
    sync: number
) => {
    const dataPayload = { associationID, sessionID, sync, senderName };
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation session started`,
        `Navigation session has been started by ${senderName}`
    );
    const dataMessage = buildDataMessage('nav_start', dataPayload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};

/**
 * Builds and sends a navigation ended message.
 * @param targetID ID of target.
 * @param sessionID ID of session.
 * @param sync Sync count.
 */
export const sendNavigationEndMessage = async (
    targetID: number,
    sessionID: number,
    sync: number
) => {
    const dataPayload = { sessionID, sync };
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation session ended`,
        `Navigation session has been ended`
    );
    const dataMessage = buildDataMessage('nav_end', dataPayload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};

/**
 * Builds and sends a control switched message.
 * @param targetID ID of target.
 * @param sessionID ID of session.
 * @param carerHasControl Whether carer has control.
 * @param sync Sync count.
 */
export const sendNavigationControlSwitchedMessage = async (
    targetID: number,
    sessionID: number,
    carerHasControl: boolean,
    sync: number
) => {
    const dataPayload = { sessionID, carerHasControl, sync };
    const dataMessage = buildDataMessage('nav_control_switch', dataPayload);
    await sendMessage(dataMessage, targetID);
};

/**
 * Builds and sends a location update message.
 * @param targetID ID of target.
 * @param sessionID ID of session.
 * @param lat Latitude of AP.
 * @param lon Longitude of AP.
 * @param sync Sync count.
 */
export const sendNavigationLocationMessage = async (
    targetID: number,
    sessionID: number,
    lat: number,
    lon: number,
    sync: number
) => {
    const dataPayload = { lat, lon, sync };
    const dataMessage = buildDataMessage('nav_location_update', dataPayload);
    await sendMessage(dataMessage, targetID);
};

/**
 * Builds and sends a route update message.
 * @param apID ID of AP.
 * @param carerID ID of carer.
 * @param sessionID ID of session.
 * @param sync Sync count.
 */
export const sendRouteUpdateMessage = async (
    apID: number,
    carerID: number,
    sessionID: number,
    sync: number
) => {
    const dataMessage = buildDataMessage('route_update', { sessionID, sync });
    await sendMessage(dataMessage, [apID, carerID]);
};

/**
 * Builds and sends an AP off-track message.
 * @param targetID ID of target.
 * @param sessionID ID of session.
 * @param name Name of AP.
 * @param sync Sync count.
 */
export const sendOffTrackMessage = async (
    targetID: number,
    sessionID: number,
    name: string,
    sync: number
) => {
    const dataMessage = buildDataMessage('nav_off_track', { sessionID, sync });
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation off-track`,
        `${name} seems to be be off-track`
    );
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};
