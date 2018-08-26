import jwt from 'jsonwebtoken';

// Get secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'default';

/**
 * Signs the payload and returns the token.
 * @param {Object} payload The payload to be signed.
 * @param {string} [expiresIn] When the token should expire.
 * @return {Promise} Promise object representing the JWT token.
 */
export const jwt_sign = (payload: any, expiresIn?: string): Promise<string> => {
    //
    const options: any = {};
    if (expiresIn) {
        options.expiresIn = expiresIn;
    }

    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET, options, (err: Error, token: string) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
};

/**
 * Verifies the token and returns the decoded payload.
 * @param {string} token The JWT token to be verified.
 * @return {Promise} Promise object representing the decoded payload.
 */
export const jwt_verify = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err: Error, decoded: any) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        });
    });
};
