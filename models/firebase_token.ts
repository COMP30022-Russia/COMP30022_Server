import Sequelize from 'sequelize';

// Define schema for device tokens
const firebaseTokenSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
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
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(firebaseTokenSchema, {
            sequelize
        });
    }
}
