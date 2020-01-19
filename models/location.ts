import Sequelize from 'sequelize';

// Define schema for location
const locationSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lat: { type: Sequelize.DECIMAL, allowNull: false },
    lon: { type: Sequelize.DECIMAL, allowNull: false }
};

/**
 * Class representing model of location.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Location extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init.call(this, locationSchema, { sequelize });
    }
}
