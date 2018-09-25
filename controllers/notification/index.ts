import models from '../../models';
import send, { appendToken } from '../../helpers/notifications';
import { getFirebaseTokensHelper, removeFirebaseTokenHelper } from './actions';
import { updateFirebaseToken, getFirebaseTokens } from './actions';
export { updateFirebaseToken, getFirebaseTokens };

// The default priority
const DEFAULT_PRIORITY = 'normal';
/**
 * Builds an android notification message.
 * @param {string} title Title of message.
 * @param {string} body Body of message.
 * @param {string} [priority] Priority of message.
 * @returns {Object} Message object with specified content.
 */
export const buildAndroidNotificationMessage = (
    title: string,
    body: string,
    priority?: string
) => {
    const message: any = {
        android: {
            priority: priority ? priority : DEFAULT_PRIORITY,
            notification: {
                title,
                body
            }
        }
    };
    return message;
};

/**
 * Builds a data message.
 * @param {string} type The type of the message.
 * @param {Object} data Data of message.
 * @returns {Object} Message object with data.
 */
export const buildDataMessage = (type: string, content: any) => {
    return {
        data: {
            type,
            data: JSON.stringify(content)
        }
    };
};

/**
 * Sends a message to the specified receipient.
 * @param {Object} message The message to be sent.
 * @param {number} receipientID The ID of the receipient.
 */
export const sendMessage = async (message: any, userID: number) => {
    // Only send in production environment
    if (process.env.NODE_ENV !== 'production') {
        // Output message to console if in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log(message);
        }
        return;
    }

    // Get token of target user and send message
    const userFirebaseTokens = await getFirebaseTokensHelper(userID);

    // Send the message with given tokens
    for (const token of userFirebaseTokens) {
        try {
            await send(appendToken(message, token));
        } catch (err) {
            if (err.message === 'Requested entity was not found.') {
                // Remove if token is invalid
                try {
                    await removeFirebaseTokenHelper(token);
                } catch (err) {
                    console.error(err);
                }
            } else {
                // If not, log error
                console.error(err);
            }
        }
    }
};
