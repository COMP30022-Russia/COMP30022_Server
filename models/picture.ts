import Sequelize from 'sequelize';

// Define schema for pictures
const pictureSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uploadState: {
        type: Sequelize.ENUM('Uploading', 'Uploaded', 'Failed')
    },
    url: {
        type: Sequelize.STRING,
        allowNull: true
    }
};

/**
 * Class representing model of text chat pictures.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Picture extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(pictureSchema, {
            sequelize
        });
    }
}
