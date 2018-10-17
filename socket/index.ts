// Import controller functions
import { jwt_verify } from '../helpers/jwt';
import { getFirebaseTokensHelper } from '../controllers/notification/actions';
import { Server, Namespace } from 'socket.io';

// Socket IO instance
let io: Server;
let namespace: Namespace;

/**
 * Initialises/configures socket.io.
 * @param socket_io Socket IO instance.
 */
export default (socket_io: Server) => {
    // Authorization for connection
    // Adapted from https://stackoverflow.com/questions/36788831
    socket_io.of('/socket').use(async (socket, next) => {
        // If query parameters are missing
        if (
            !socket.handshake.query ||
            !socket.handshake.query.auth_token ||
            !socket.handshake.query.firebase_token
        ) {
            return next(new Error('Authentication error'));
        }

        try {
            // Verify connection
            await verifyAuthentication(
                socket.handshake.query.auth_token,
                socket.handshake.query.firebase_token
            );
            next();
        } catch (err) {
            // If authentication fails and a string is returned
            return next(err);
        }
    });

    io = socket_io;
    namespace = io.of('/socket');
};

/**
 * Receives and resends/emits server/client data messages.
 * @param {string[]} tokens List of Firebase tokens
 * @param {string} data_message Data to send.
 */
export const sendServerMessage = (tokens: string[], data_message: string) => {
    return new Promise((resolve, reject) => {
        if (!namespace || !namespace.sockets) {
            reject('Something wrong with socket.io');
        }

        // Extract instanceIDs
        const instanceIDs = tokens.map((t: string) => extractInstanceID(t));

        // Send message to sockets with same instanceIDs
        for (const instanceID of instanceIDs) {
            for (const socket of Object.keys(namespace.connected)) {
                if (
                    extractInstanceID(
                        namespace.connected[socket].handshake.query
                            .firebase_token
                    ) === instanceID
                ) {
                    namespace.connected[socket].emit(
                        'data_message',
                        data_message
                    );
                    break;
                }
            }
        }
        resolve();
    });
};

/**
 * Extracts Firebase instanceID from token.
 * @param {string} token Firebase token.
 * @return Corresponding instanceID.
 */
const extractInstanceID = (token: string) => {
    return token.split(':')[0];
};

/**
 * Verify socket.io connection authentication.
 * @param {string} auth_token Server auth token.
 * @param {string} firebase_token Firebase auth token.
 * @return {Promise<boolean>} Promise for success/failure.
 */
const verifyAuthentication = async (
    auth_token: string,
    firebase_token: string
) => {
    // Fake authentication on non-production environments
    if (process.env.NODE_ENV !== 'production') {
        if (auth_token && firebase_token) {
            return true;
        } else {
            throw new Error('Invalid tokens');
        }
    }

    // Decode auth token to user ID
    let userID: number;
    try {
        userID = (await jwt_verify(auth_token)).id;
    } catch (err) {
        throw new Error('Auth token is invalid');
    }

    // Verify that token is in list of user's tokens
    const tokens: string[] = await getFirebaseTokensHelper(userID);
    if (!tokens.includes(firebase_token)) {
        throw new Error('Token is invalid');
    }
};
