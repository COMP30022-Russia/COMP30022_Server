import Sequelize from 'sequelize';

// Define schema for destination
const destinationSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lat: {
        type: Sequelize.NUMERIC,
        allowNull: false
    },
    lon: {
        type: Sequelize.NUMERIC,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    favourite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
};

/**
 * Class representing model of destination locations.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Destination extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(destinationSchema, {
            sequelize
        });
    }
}
