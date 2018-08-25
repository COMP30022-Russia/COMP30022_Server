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
    transportMode: {
        type: Sequelize.ENUM('walking', 'PT'),
        defaultValue: 'walking',
        allowNull: false
    },
    route: {
        type: Sequelize.JSON,
        allowNull: true
    }
};

/**
 * Class representing model of sessions.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Session extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(sessionSchema, {
            sequelize
        });
    }
}
