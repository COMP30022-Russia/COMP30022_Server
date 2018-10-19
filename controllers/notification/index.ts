import send from '../../helpers/notifications';
import {
    getFirebaseTokensHelper,
    replaceFirebaseToken,
    removeFirebaseToken
} from './actions';
export { updateFirebaseToken, getFirebaseTokens } from './actions';

/**
 * Builds an Firebase android notification message.
 * @param title Title of message.
 * @param body Body of message.
 * @param [priority] Priority of message.
 */
export const buildAndroidNotificationMessage = (
    title: string,
    body: string,
    priority?: string
) => {
    return {
        notification: {
            title,
            body
        }
    };
};

/**
 * Builds a Firebase data message.
 * @param type The type of the message.
 * @param content Content of message.
 * @param [priority] Priority of message.
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
 * Sends a message to the specified recipient.
 * @param message The message to be sent.
 * @param userID The ID(s) of the recipient.
 */
export const sendMessage = async (message: any, userID: number | number[]) => {
    // Only send in production environment
    if (process.env.NODE_ENV !== 'production') {
        // Output message to console if in development environment
        if (process.env.NODE_ENV === 'development') {
            console.info(message);
        }
        return;
    }

    // Get token of target user(s)
    let tokens: string[] = [];
    if (Array.isArray(userID)) {
        // More than 1 user
        for (const id of userID) {
            tokens.push(...(await getFirebaseTokensHelper(id)));
        }
    } else {
        // One user only
        tokens = await getFirebaseTokensHelper(userID as number);
    }

    // Stop if there are no tokens
    if (tokens.length === 0) {
        return;
    }

    try {
        // Send the message with given tokens
        const response = await send(message, tokens);

        // If there are errors
        if (response.failureCount !== 0) {
            response.results.map(async (result, i) => {
                // Replace token, if applicable
                if (result.canonicalRegistrationToken) {
                    await replaceFirebaseToken(
                        tokens[i],
                        result.canonicalRegistrationToken
                    );
                }

                // Remove token, if applicable
                if (result.error) {
                    if (
                        result.error.code ===
                        'messaging/registration-token-not-registered'
                    ) {
                        await removeFirebaseToken(tokens[i]);
                    } else {
                        console.error(result.error);
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
};
