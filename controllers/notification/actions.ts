import models from '../../models';
import { Request, Response, NextFunction } from 'express';

// Add to/updates the current user's Firebase token
// Adapted from: https://stackoverflow.com/questions/41924281
export const updateFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;
    const instanceID = req.body.instanceID;
    const token = req.body.token;

    try {
        // Retrieve user with device tokens
        const user = await models.User.scope('id').findById(userID);

        // Remove all occurrences of tokens with the given instanceID
        await models.FirebaseToken.destroy({ where: { instanceID } });

        // Create and add new token
        const createdToken = await models.FirebaseToken.create({
            token,
            instanceID
        });
        await user.addFirebaseToken(createdToken);
        return res.json({ status: 'success' });
    } catch (err) {
        res.status(400);
        return next(err);
    }
};

// Gets the current user's Firebase tokens
export const getFirebaseTokens = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;

    try {
        // Get and return tokens as array
        const tokens: [string] = await getFirebaseTokensHelper(userID);
        return res.json({ id: userID, tokens });
    } catch (err) {
        res.status(400);
        return next(err);
    }
};

/**
 * Retrieves the Firebase tokens of the specified user as an array.
 * @param {number} userID ID of user.
 * @returns {Promise} Promise for tokens of specified user.
 */
export const getFirebaseTokensHelper = async (
    userID: number
): Promise<[string]> => {
    // Query for user
    const user = await models.User.scope('id').findById(userID);
    // Query for user's associated tokens
    const tokenObjects = await user.getFirebaseTokens();
    // Extract tokens from objects
    return tokenObjects.map((o: any) => o.token);
};

/**
 * Replaces an old token with a new token.
 * @param {string} oldToken The old token.
 * @param {string} newToken The new token.
 * @returns {Promise} Promise for completion.
 */
export const replaceFirebaseToken = async (
    oldToken: string,
    newToken: string
): Promise<void> => {
    const token = await models.FirebaseToken.findOne({ token: oldToken });
    await token.updateAttributes({ token: newToken });
};

/**
 * Removes a Firebase token.
 * @param {string} token The token.
 * @returns {Promise} Promise for completion.
 */
export const removeFirebaseToken = async (token: string): Promise<void> => {
    await models.FirebaseToken.destroy({ where: { token } });
};
