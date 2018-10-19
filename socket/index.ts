// Import controller functions
import { jwtVerify } from '../helpers/jwt';
import { getFirebaseTokensHelper } from '../controllers/notification/actions';
import { Server, Namespace } from 'socket.io';

// Socket IO instance
let io: Server;
let namespace: Namespace;

/**
 * Initialises/configures socket.io.
 * @param socket_io Socket IO instance.
 */
export default (socketIO: Server) => {
    // Authorization for connection
    // Adapted from https://stackoverflow.com/questions/36788831
    socketIO.of('/socket').use(async (socket, next) => {
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

    io = socketIO;
    namespace = io.of('/socket');
};

/**
 * Receives and resends/emits server/client data messages.
 * @param tokens List of Firebase tokens
 * @param dataMessage Data to send.
 */
export const sendServerMessage = (tokens: string[], dataMessage: string) => {
    return new Promise((resolve, reject) => {
        if (!namespace || !namespace.sockets) {
            reject('Something wrong with socket.io');
        }

        // Extract instanceIDs
        const instanceIDs = tokens.map(extractInstanceID);

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
                        dataMessage
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
 * @param token Firebase token.
 * @return Corresponding instanceID.
 */
const extractInstanceID = (token: string) => {
    return token.split(':')[0];
};

/**
 * Verify socket.io connection authentication.
 * @param auth_token Server auth token.
 * @param firebase_token Firebase auth token.
 * @return Promise for success/failure.
 */
const verifyAuthentication = async (
    authToken: string,
    firebaseToken: string
) => {
    // Fake authentication on non-production environments
    if (process.env.NODE_ENV !== 'production') {
        if (authToken && firebaseToken) {
            return true;
        } else {
            throw new Error('Invalid tokens');
        }
    }

    // Decode auth token to user ID
    let userID: number;
    try {
        userID = (await jwtVerify(authToken)).id;
    } catch (err) {
        throw new Error('Auth token is invalid');
    }

    // Verify that token is in list of user's tokens
    const tokens: string[] = await getFirebaseTokensHelper(userID);
    if (!tokens.includes(firebaseToken)) {
        throw new Error('Token is invalid');
    }
};
