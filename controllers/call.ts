import models from '../models';
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
    sendNavigationCallStateChangeMessage,
    sendNavigationCallTerminatedMessage,
    sendCallStartedMessage
} from './notification/call';

// Returns a call
export const getCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;
    return res.json(call.toJSON());
};

// Updates/sets call state
export const setCallState = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;
    const newState = req.body.state;

    // Only allow transitions between Ongoing and OngoingCamera
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

        return res.json(call.toJSON());
    } catch (err) {
        return next(err);
    }
};

// Failure count limit
const FAILURE_COUNT_THRESHOLD = 5;
// Update failure count and terminate call when limit is reached
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

// Accepts a call in the pending stage
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

    // Reject request if user is not initiator
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

// Terminates a call in the pending stage
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

    // Terminate the call
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
 * @param carerIsInitiator Whether the carer is the initiator.
 * @param userID User ID.
 * @param apId ID of AP.
 * @param carerId ID of carer.
 * @return Whether user is initiator.
 */
const userIsInitiator = (
    carerIsInitiator: boolean,
    userID: number,
    apId: number,
    carerId: number
) => {
    if (carerIsInitiator && carerId === userID) {
        return true;
    } else if (!carerIsInitiator && apId === userID) {
        return true;
    }
    return false;
};

// Terminates a call
export const endCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const call = req.call;

    try {
        await terminateCall(call, 'normal');
        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};

/**
 * Helper for terminating calls.
 * @param call The call.
 * @param reason Reason for termination.
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
    // Find pending calls which have exceeded timeout
    const calls = await models.Call.findAll({
        where: {
            state: 'Pending',
            updatedAt: {
                [Op.lte]: Date.now() - CALL_PENDING_TIMEOUT
            }
        }
    });
    // Terminate each call
    for (const call of calls) {
        await terminateCall(call, 'pending_timeout');
    }
};
