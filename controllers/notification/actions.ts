import models from '../../models';
import { Request, Response, NextFunction } from 'express';

// Updates the current user's Firebase tokens
export const updateFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;
    const instanceID = req.body.instanceID;
    const token = req.body.token;

    try {
        // Remove all occurrences of tokens with given instanceID
        await models.FirebaseToken.destroy({
            where: { instanceID, userId: userID }
        });

        // Create and add new token
        const createdToken = await models.FirebaseToken.create({
            token,
            instanceID
        });

        // Add created token to user
        const user = await models.User.scope('id').findById(userID);
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
        // Get and return tokens as array of strings
        const tokens: [string] = await getFirebaseTokensHelper(userID);
        return res.json({ id: userID, tokens });
    } catch (err) {
        return next(err);
    }
};

/**
 * Retrieves the Firebase tokens of the specified user as an array.
 * @param userID ID of user.
 * @return Promise for Firebase tokens of specified user.
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
 * @param oldToken The old token.
 * @param newToken The new token.
 * @return Promise for completion.
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
 * @param token The token.
 * @return Promise for completion.
 */
export const removeFirebaseToken = async (token: string): Promise<void> => {
    await models.FirebaseToken.destroy({ where: { token } });
};
