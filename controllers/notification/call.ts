import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends a navigation call start request message.
 * @param {number} callID Voice/video call ID.
 * @param {number} sessionID Navigation session ID.
 * @param {number} senderName Name of initiator of call.
 * @param {number} senderID ID of sender.
 * @param {number} targetID ID of target.
 */
export const sendNavigationCallRequestStartMessage = async (
    callID: number,
    sessionID: number,
    senderName: string,
    senderID: number,
    targetID: number
) => {
    const data_payload = {
        sessionID,
        callID,
        senderName,
        sync: 1
    };

    // Send accept_other message to target
    const notificationMessage = buildAndroidNotificationMessage(
        `Voice call request`,
        `${senderName} wants to start a voice call with you`
    );
    const dataMessageTarget = buildDataMessage(
        'nav_voice_pending_accept_other',
        data_payload
    );
    await sendMessage(
        { ...dataMessageTarget, ...notificationMessage },
        targetID
    );

    // Sender accept_me message to initiator
    const dataMessageSender = buildDataMessage(
        'nav_voice_pending_accept_me',
        data_payload
    );
    await sendMessage(dataMessageSender, senderID);
};

/**
 * Builds and sends call started message to both party of call.
 * @param {number} callID Voice/video call ID.
 * @param {number} sync Sync count.
 * @param {number} sessionID Navigation session ID.
 * @param {number} targetIDs IDs of targets.
 */
export const sendCallStartedMessage = async (
    callID: number,
    sync: number,
    sessionID: number,
    targetIDs: number[]
) => {
    const data_payload = {
        callID,
        sessionID,
        sync
    };
    const dataMessage = buildDataMessage('nav_call_started', data_payload);
    await sendMessage(dataMessage, targetIDs);
};

/**
 * Builds and sends voice/video state change messages to both party of call.
 * @param {number} callID Voice/video call ID.
 * @param {number} sync Sync count.
 * @param {number} sessionID Navigation session ID.
 * @param {string} state New state.
 * @param {number} targetIDs IDs of targets.
 */
export const sendNavigationCallStateChangeMessage = async (
    callID: number,
    sync: number,
    sessionID: number,
    state: string,
    targetIDs: number[]
) => {
    const data_payload = {
        callID,
        sessionID,
        sync,
        state
    };
    const dataMessage = buildDataMessage('nav_voice_state', data_payload);
    await sendMessage(dataMessage, targetIDs);
};

/**
 * Builds and sends voice/video state terminated messages to both party of call.
 * @param {number} callID Voice/video call ID.
 * @param {number} sync Sync count.
 * @param {number} sessionID Navigation session ID.
 * @param {string} reason Reason for termination.
 * @param {number} targetIDs IDs of targets.
 */
export const sendNavigationCallTerminatedMessage = async (
    callID: number,
    sync: number,
    sessionID: number,
    reason: string,
    targetIDs: number[]
) => {
    const data_payload = {
        callID,
        sessionID,
        sync,
        reason
    };
    const dataMessage = buildDataMessage('nav_call_terminated', data_payload);
    await sendMessage(dataMessage, targetIDs);
};
