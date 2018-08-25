import Sequelize from 'sequelize';

// Define emergency schema
const emergencySchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
};

/**
 * Class representing model of emergencies.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Emergency extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(emergencySchema, {
            sequelize
        });
    }
}
