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
     * @param {sequelize} sequelize Sequelize instance.
     */
    static init(sequelize: Sequelize.Sequelize) {
        return super.init(associationSchema, { sequelize });
    }

    /**
     * Retrieves the ID of the opposite party (partner).
     * @param {number} myID The current user's ID.
     * @return {Promise} Promise object for ID of opposite party.
     */
    getPartnerID = function(myID: number): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.APId || !this.carerId) {
                reject(new Error('APId or carerId is not in object'));
            }
            if (!myID) {
                reject(new Error('User ID is not valid'));
            }

            if (this.APId === myID) {
                resolve(this.carerId);
            } else {
                resolve(this.APId);
            }
        });
    };
}
