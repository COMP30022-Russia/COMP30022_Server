import Sequelize from 'sequelize';

// Define message schema
const messageSchema = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: Sequelize.STRING,
        allowNull: true
    },
    type: {
        type: Sequelize.ENUM('Message', 'Picture'),
        allowNull: false,
        defaultValue: 'Message'
    }
};

/**
 * Class representing model of chat messges.
 */
// @ts-ignore: @types/sequelize is not up to date with v4
export default class Message extends Sequelize.Model {
    /**
     * Initalises the model with the specified attributes and options.
     * @param {sequelize} sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(messageSchema, { sequelize });
    }
}
