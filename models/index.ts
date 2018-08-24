import Sequelize, { Op } from 'sequelize';

// Import defined schemas
import User from './user';

// Define database connection
const sequelize: Sequelize.Sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        operatorsAliases: Op as any,
        logging: process.env.NODE_ENV === 'development' ? true : false
    }
);

const db: any = {};

// Import/associate models
db.User = User.init(sequelize);

db.sequelize = sequelize;
db.Sequelize = sequelize;

export default db;
export { sequelize };
