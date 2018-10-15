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
    const data_payload = { associationID, sessionID };
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
 */
export const sendNavigationEndMessage = async (
    targetID: number,
    sessionID: number
) => {
    const data_payload = { sessionID };
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
 */
export const sendNavigationControlSwitchedMessage = async (
    targetID: number,
    sessionID: number,
    carerHasControl: boolean
) => {
    const data_payload = { sessionID, carerHasControl };
    const dataMessage = buildDataMessage('nav_control_switch', data_payload);
    await sendMessage(dataMessage, targetID);
};

/**
 * Builds and sends a location update message.
 * @param {number} targetID ID of target.
 * @param {number} sessionID ID of session.
 * @param {number} lat Latitude of AP.
 * @param {number} lon Longitude of AP.
 */
export const sendNavigationLocationMessage = async (
    targetID: number,
    sessionID: number,
    lat: number,
    lon: number
) => {
    const data_payload = { lat, lon };
    const dataMessage = buildDataMessage('nav_location_update', data_payload);
    await sendMessage(dataMessage, targetID);
};

/**
 * Builds and sends a route update message.
 * @param {number} apID ID of AP.
 * @param {number} carerID ID of carer.
 * @param {number} sessionID ID of session.
 */
export const sendRouteUpdateMessage = async (
    apID: number,
    carerID: number,
    sessionID: number
) => {
    const dataMessage = buildDataMessage('route_update', { sessionID });
    await sendMessage(dataMessage, [apID, carerID]);
};

/**
 * Builds and sends an AP off-track message.
 * @param {number} targetID ID of target.
 * @param {number} sessionID ID of session.
 * @param {string} name Name of AP.
 */
export const sendOffTrackMessage = async (
    targetID: number,
    sessionID: number,
    name: string
) => {
    const dataMessage = buildDataMessage('nav_off_track', { sessionID });
    const notificationMessage = buildAndroidNotificationMessage(
        `Navigation off-track`,
        `${name} seems to be be off-track`
    );
    await sendMessage({ ...dataMessage, ...notificationMessage }, targetID);
};
