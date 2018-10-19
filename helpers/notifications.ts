import * as admin from 'firebase-admin';
import { sendServerMessage } from '../socket';

// Initalise firebase in production environments
// From https://firebase.google.com/docs/admin/setup#initialize_the_sdk
if (process.env.NODE_ENV === 'production') {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

// Default priority for both notification and data messages
const DEFAULT_PRIORITY = 'high';

/**
 * Sends a message to the socket service and FCM.
 * @param message The payload to be sent.
 * @param tokens List of device tokens.
 * @return Promise object representing the response.
 */
export default async function(
    message: any,
    tokens: string[]
): Promise<admin.messaging.MessagingDevicesResponse> {
    // Send message to socket service
    try {
        await sendServerMessage(tokens, JSON.stringify(message.data));
    } catch (err) {
        console.error(err);
    }

    // Send the message and return the response
    return new Promise<admin.messaging.MessagingDevicesResponse>(
        (resolve, reject) => {
            admin
                .messaging()
                .sendToDevice(tokens, message, { priority: DEFAULT_PRIORITY })
                .then((response: admin.messaging.MessagingDevicesResponse) => {
                    resolve(response);
                })
                .catch((err: Error) => {
                    reject(err);
                });
        }
    );
}
