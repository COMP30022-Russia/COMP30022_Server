import Sequelize from 'sequelize';

// Define schema for calls
const callSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // State of call
    state: {
        type: Sequelize.ENUM(
            'Pending',
            'Ongoing',
            'OngoingCamera',
            'Terminated'
        ),
        allowNull: false,
        defaultValue: 'Pending'
    },
    // Value used for synchronisation
    sync: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    // Current failure count of call
    failureCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // Whether carer is initiator
    carerIsInitiator: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
};

/**
 * Class representing model of voice/video calls.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Call extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(callSchema, { sequelize });
    }
}
