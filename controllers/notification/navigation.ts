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
 * @param {number} sync Sync count.
 */
export const sendNavigationStartMessage = async (
    senderName: string,
    targetID: number,
    associationID: number,
    sessionID: number,
    sync: number
) => {
    const data_payload = { associationID, sessionID, sync, senderName };
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation session started`,
        `Navigation session has been started by ${senderName}`
    );
    const dataMessage = buildDataMessage('nav_start', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};

/**
 * Builds and sends a navigation ended message.
 * @param {number} targetID ID of target.
 * @param {number} sessionID ID of session.
 * @param {number} sync Sync count.
 */
export const sendNavigationEndMessage = async (
    targetID: number,
    sessionID: number,
    sync: number
) => {
    const data_payload = { sessionID, sync };
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation session ended`,
        `Navigation session has been ended`
    );
    const dataMessage = buildDataMessage('nav_end', data_payload);
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};

/**
 * Builds and sends a control switched message.
 * @param {number} targetID ID of target.
 * @param {number} sessionID ID of session.
 * @param {boolean} carerHasControl Whether carer has control.
 * @param {number} sync Sync count.
 */
export const sendNavigationControlSwitchedMessage = async (
    targetID: number,
    sessionID: number,
    carerHasControl: boolean,
    sync: number
) => {
    const data_payload = { sessionID, carerHasControl, sync };
    const dataMessage = buildDataMessage('nav_control_switch', data_payload);
    await sendMessage(dataMessage, targetID);
};

/**
 * Builds and sends a location update message.
 * @param {number} targetID ID of target.
 * @param {number} sessionID ID of session.
 * @param {number} lat Latitude of AP.
 * @param {number} lon Longitude of AP.
 * @param {number} sync Sync count.
 */
export const sendNavigationLocationMessage = async (
    targetID: number,
    sessionID: number,
    lat: number,
    lon: number,
    sync: number
) => {
    const data_payload = { lat, lon, sync };
    const dataMessage = buildDataMessage('nav_location_update', data_payload);
    await sendMessage(dataMessage, targetID);
};

/**
 * Builds and sends a route update message.
 * @param {number} apID ID of AP.
 * @param {number} carerID ID of carer.
 * @param {number} sessionID ID of session.
 * @param {number} sync Sync count.
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
 * @param {number} targetID ID of target.
 * @param {number} sessionID ID of session.
 * @param {string} name Name of AP.
 * @param {number} sync Sync count.
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
