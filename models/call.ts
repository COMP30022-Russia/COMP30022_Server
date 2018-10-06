import Sequelize from 'sequelize';

// Define schema for calls
const callSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Status of call
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
    sync: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    failureCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
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
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(callSchema, {
            sequelize
        });
    }
}
