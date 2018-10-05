import models from '../../models';
import send from '../../helpers/notifications';
import {
    getFirebaseTokensHelper,
    replaceFirebaseToken,
    removeFirebaseToken
} from './actions';
import { updateFirebaseToken, getFirebaseTokens } from './actions';
export { updateFirebaseToken, getFirebaseTokens };

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
        notification: {
            title,
            body
        }
    };
    return message;
};

/**
 * Builds a data message.
 * @param {string} type The type of the message.
 * @param {Object} data Data of message.
 * @param {string} [priority] Priority of message.
 * @returns {Object} Message object with data.
 */
export const buildDataMessage = (
    type: string,
    content: any,
    priority?: string
) => {
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
 * @param {number|[number]} userID The ID(s) of the receipient.
 */
export const sendMessage = async (message: any, userID: number | number[]) => {
    // Only send in production environment
    if (process.env.NODE_ENV !== 'production') {
        // Output message to console if in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log(message);
        }
        return;
    }

    // Get token of target user(s)
    let tokens: string[] = [];
    if (Array.isArray(userID)) {
        for (const id of userID) {
            tokens.push(...(await getFirebaseTokensHelper(id)));
        }
    } else {
        tokens = await getFirebaseTokensHelper(<number>userID);
    }

    // Send the message with given tokens
    try {
        const response = await send(message, tokens);

        // If there are errors
        if (response.failureCount !== 0) {
            for (const i in response.results) {
                // Get current result
                const result = response.results[i];

                // Replace token, if applicable
                if (result.canonicalRegistrationToken) {
                    await replaceFirebaseToken(
                        tokens[i],
                        result.canonicalRegistrationToken
                    );
                }

                if (result.error) {
                    // Remove token, if applicable
                    if (
                        result.error.code ===
                        'messaging/registration-token-not-registered'
                    ) {
                        await removeFirebaseToken(tokens[i]);
                    } else {
                        console.error(result.error);
                    }
                }
            }
        }
    } catch (err) {
        // Log error
        console.error(err);
    }
};
