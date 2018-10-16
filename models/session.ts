import Sequelize from 'sequelize';

// Define schema for session
const sessionSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    // Whether the carer has control of interface
    carerHasControl: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    state: {
        type: Sequelize.ENUM('Searching', 'Started'),
        defaultValue: 'Searching',
        allowNull: false
    },
    transportMode: {
        type: Sequelize.ENUM('Walking', 'PT'),
        defaultValue: 'Walking',
        allowNull: false
    },
    // Route of session (as JSON)
    route: {
        type: Sequelize.JSON,
        allowNull: true
    },
    // Value used for synchronisation
    sync: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
};

/**
 * Class representing model of sessions.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Session extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(sessionSchema, { sequelize });
    }
}
