import Sequelize from 'sequelize';

// Define association schema
const associationSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
};

/**
 * Class representing model of association.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Association extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(associationSchema, {
            sequelize
        });
    }
}
