import {
    buildDataMessage,
    buildAndroidNotificationMessage,
    sendMessage
} from './';

/**
 * Builds and sends a navigation call start request message.
 * @param callID Call ID.
 * @param sessionID Navigation session ID.
 * @param senderName Name of initiator of call.
 * @param senderID ID of sender.
 * @param targetID ID of target.
 */
export const sendNavigationCallRequestStartMessage = async (
    callID: number,
    sessionID: number,
    senderName: string,
    senderID: number,
    targetID: number
) => {
    const dataPayload = { sessionID, callID, senderName, sync: 1 };

    // Send accept_other message to target
    const notificationMessage = buildAndroidNotificationMessage(
        `Voice call request`,
        `${senderName} wants to start a voice call with you`
    );
    const dataMessageTarget = buildDataMessage(
        'nav_voice_pending_accept_other',
        dataPayload
    );
    await sendMessage(
        { ...dataMessageTarget, ...notificationMessage },
        targetID
    );

    // Sender accept_me message to initiator
    const dataMessageSender = buildDataMessage(
        'nav_voice_pending_accept_me',
        dataPayload
    );
    await sendMessage(dataMessageSender, senderID);
};

/**
 * Builds and sends call started message to both party of call.
 * @param callID Call ID.
 * @param sync Sync count.
 * @param sessionID Navigation session ID.
 * @param targetIDs IDs of targets.
 */
export const sendCallStartedMessage = async (
    callID: number,
    sync: number,
    sessionID: number,
    targetIDs: number[]
) => {
    const dataPayload = { callID, sessionID, sync };
    const dataMessage = buildDataMessage('nav_call_started', dataPayload);
    await sendMessage(dataMessage, targetIDs);
};

/**
 * Builds and sends call state change messages to both party of call.
 * @param callID Call ID.
 * @param sync Sync count.
 * @param sessionID Navigation session ID.
 * @param state New state.
 * @param targetIDs IDs of targets.
 */
export const sendNavigationCallStateChangeMessage = async (
    callID: number,
    sync: number,
    sessionID: number,
    state: string,
    targetIDs: number[]
) => {
    const dataPayload = { callID, sessionID, sync, state };
    const dataMessage = buildDataMessage('nav_voice_state', dataPayload);
    await sendMessage(dataMessage, targetIDs);
};

/**
 * Builds and sends call state terminated messages to both party of call.
 * @param callID Call ID.
 * @param sync Sync count.
 * @param sessionID Navigation session ID.
 * @param reason Reason for termination.
 * @param targetIDs IDs of targets.
 */
export const sendNavigationCallTerminatedMessage = async (
    callID: number,
    sync: number,
    sessionID: number,
    reason: string,
    targetIDs: number[]
) => {
    const dataPayload = { callID, sessionID, sync, reason };
    const dataMessage = buildDataMessage('nav_call_terminated', dataPayload);
    await sendMessage(dataMessage, targetIDs);
};
