import Sequelize from 'sequelize';

// Define schema for profile pictures
const profilePictureSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    filename: {
        type: Sequelize.STRING,
        allowNull: true
    },
    mime: {
        type: Sequelize.STRING,
        allowNull: true
    }
};

/**
 * Class representing model of profile pictures.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class ProfilePicture extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(profilePictureSchema, {
            sequelize
        });
    }
}
