import Sequelize from 'sequelize';

// Define schema for Firebase tokens
const firebaseTokenSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Latest registration token of client app instance
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Instance ID of client device
    instanceID: {
        type: Sequelize.STRING,
        allowNull: false
    }
};

/**
 * Class representing model of device tokens.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class FirebaseToken extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init.call(this, firebaseTokenSchema, { sequelize });
    }
}
