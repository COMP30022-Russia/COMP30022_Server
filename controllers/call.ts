import models from '../models';
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
    sendNavigationCallStateChangeMessage,
    sendNavigationCallTerminatedMessage,
    sendCallStartedMessage
} from './notification/call';

// Gets a navigation voice/video call
export const getCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;
    return res.json(call);
};

// Updates/sets the status of a voice/video call.
export const setCallState = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;
    const newState = req.body.state;

    // Reject, if old/new states are not ongoing/ongoing camera
    if (
        (call.state !== 'Ongoing' && call.state !== 'OngoingCamera') ||
        (newState !== 'Ongoing' && newState !== 'OngoingCamera') ||
        newState === call.state
    ) {
        res.status(400);
        return next(new Error('Invalid state change'));
    }

    try {
        // Perform update
        call.sync += 1;
        call.state = newState;
        call.failureCount = 0;
        await call.save();

        // Send data message
        // Note: currently call is always started within navigation session
        // So this if statement should be the only path
        if (call.sessionId) {
            await sendNavigationCallStateChangeMessage(
                call.id,
                call.sync,
                call.sessionId,
                newState,
                [call.APId, call.carerId]
            );
        }

        return res.json(call);
    } catch (err) {
        return next(err);
    }
};

// Update failure count and terminates call
const FAILURE_COUNT_THRESHOLD = 5;
export const updateCallFailureCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;

    try {
        // Increment failure count
        call.failureCount += 1;

        // Terminate if failure count is exceeded
        if (call.failureCount >= FAILURE_COUNT_THRESHOLD) {
            await terminateCall(call, 'failure_count_exceeded');
        } else {
            await call.save();
        }

        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};

// Accepts a call
export const acceptCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;
    const userID = req.userID;

    // Ensure that call is in pending state
    if (call.state !== 'Pending') {
        res.status(400);
        return next(new Error('Can only accept in pending state'));
    }

    // Reject accept when user is not initiator
    if (
        userIsInitiator(call.carerIsInitiator, userID, call.APId, call.carerId)
    ) {
        res.status(400);
        return next(new Error('Initiator cannot accept call'));
    }

    try {
        // Set state to ongoing
        call.state = 'Ongoing';
        call.sync += 1;
        await call.save();

        // Send data notification
        await sendCallStartedMessage(call.id, call.sync, call.sessionId, [
            call.APId,
            call.carerId
        ]);

        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};

// Closes a call in the pending stage
export const rejectCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;
    const userID = req.userID;

    // Ensure that call is in pending state
    if (call.state !== 'Pending') {
        res.status(400);
        return next(new Error('Can only reject in pending state'));
    }

    // Determine if user is initiator
    const isInitiator: boolean = userIsInitiator(
        call.carerIsInitiator,
        userID,
        call.APId,
        call.carerId
    );

    try {
        await terminateCall(
            call,
            isInitiator ? 'initiator_declined' : 'receiver_declined'
        );
    } catch (err) {
        return next(err);
    }
    return res.json({ status: 'success' });
};

/**
 * Given parameters, determine whether user is initiator of call.
 * @param {boolean} carerIsInitiator Whether the carer is the initiator.
 * @param {number} userID User ID.
 * @param {number} APId ID of AP.
 * @param {number} carerId ID of carer.
 * @return {boolean} Whether user is initiator.
 */
const userIsInitiator = (
    carerIsInitiator: boolean,
    userID: number,
    APId: number,
    carerId: number
) => {
    if (carerIsInitiator && carerId === userID) {
        return true;
    } else if (!carerIsInitiator && APId === userID) {
        return true;
    }
    return false;
};

// Ends a call normally
export const endCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;

    try {
        // Terminate call
        await terminateCall(call, 'normal');
        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};

/**
 * Terminates a voice/video call.
 * @param {number} call ID of voice/video session.
 * @return Promise for call termination.
 */
export const terminateCall = async (call: any, reason: string) => {
    call.state = 'Terminated';
    call.sync += 1;
    await call.save();

    // Note: currently call is always started within navigation session
    // So this if statement should be the only path
    if (call.sessionId) {
        await sendNavigationCallTerminatedMessage(
            call.id,
            call.sync,
            call.sessionId,
            reason,
            [call.APId, call.carerId]
        );
    }
};

// Define pending timeout
const CALL_PENDING_TIMEOUT: number = 40 * 1000;
/**
 * Terminates idle pending calls.
 */
export const terminateIdlePendingCalls = async () => {
    const calls = await models.Call.findAll({
        where: {
            state: 'Pending',
            updatedAt: {
                [Op.lte]: Date.now() - CALL_PENDING_TIMEOUT
            }
        }
    });
    for (const call of calls) {
        await terminateCall(call, 'pending_timeout');
    }
};
