import Sequelize from 'sequelize';

// Define schema for pictures
const chatPictureSchema = {
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
    },
    status: {
        type: Sequelize.ENUM('Sending', 'Received'),
        defaultValue: 'Sending',
        allowNull: false
    }
};

/**
 * Class representing model of text chat pictures.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class ChatPicture extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} Sequelize instance to attach to the new Model.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(chatPictureSchema, {
            sequelize
        });
    }
}
