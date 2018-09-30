// Adapted from:
// https://github.com/sequelize/express-example/blob/master/models/index.js
// https://gist.github.com/JesusMurF/9d206738aa54131a6e7ac88ab2d9084e
// https://github.com/sequelize/sequelize/issues/6524
// https://github.com/sequelize/sequelize/issues/6253
import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';

// Define salt factor
const SALT_FACTOR = 10;

// Define user schema
const userSchema = {
    username: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    type: { type: Sequelize.ENUM('Carer', 'AP'), allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    mobileNumber: { type: Sequelize.STRING, allowNull: false },
    DOB: { type: Sequelize.DATEONLY, allowNull: false },
    emergencyContactName: { type: Sequelize.STRING },
    emergencyContactNumber: { type: Sequelize.STRING }
};

/**
 * Class representing model of user.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class User extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(userSchema, {
            sequelize,
            hooks: {
                // Hash password before creation
                beforeCreate: async (user: any) => {
                    try {
                        const hash = await hashPassword(user.password);
                        user.password = hash;
                    } catch (err) {
                        return sequelize.Promise.reject(err);
                    }
                },
                // Hash password before update
                beforeUpdate: async (user: any) => {
                    // If password is not changed
                    if (!user.password) return;

                    try {
                        const hash = await hashPassword(user.password);
                        user.password = hash;
                    } catch (err) {
                        return sequelize.Promise.reject(err);
                    }
                }
            },
            // Exclude password by default
            defaultScope: {
                attributes: { exclude: ['password'] }
            },
            scopes: {
                // Retrieve ID of user only
                id: {
                    attributes: ['id']
                },
                // Retrieve name of user only
                name: {
                    attributes: ['name']
                },
                // Only retrieve type of user
                type: {
                    attributes: ['id', 'type']
                },
                // Location scope - retrieve id, type and location of user
                location: {
                    attributes: ['id', 'type', 'currentLocationId']
                },
                // Retrieve with location
                withLocation: {
                    attributes: { include: ['currentLocationId'] }
                },
                // Retrieve every attribute (which includes 'password')
                withPassword: {
                    attributes: {}
                }
            }
        });
    }

    /**
     * Verifies the provided password against the password of this instance.
     * @param {string} password The password that needs to be verified.
     * @return {Promise} Promise object for result of verification.
     */
    verifyPassword = async function(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    };

    /**
     * Overrides the toJSON function to remove the password.
     * @override
     * @returns {Object} JSON representation of instance.
     */
    toJSON = function(): any {
        const r = Object.assign({}, this.get());
        delete r.password;
        return r;
    };
}

/**
 * Hashes a password using bcrypt and returns the hash.
 * @param {string} password The password to be hashed.
 * @return {Promise} Promise object for the hash of the password.
 */
function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Generate salt
        bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
            // Return on error
            if (err) {
                reject(err);
            }

            // Use salt to hash password
            bcrypt.hash(password, salt, (err: Error, hash) => {
                if (err) {
                    reject(err);
                }
                // Return hash
                resolve(hash);
            });
        });
    });
}
