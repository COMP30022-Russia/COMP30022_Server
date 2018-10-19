import Sequelize from 'sequelize';

// Define schema for destination
const destinationSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Google Maps placeID of destination
    placeID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Human readable name of destination
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Whether the destination has been favourited
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
     * @param sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(destinationSchema, { sequelize });
    }
}
