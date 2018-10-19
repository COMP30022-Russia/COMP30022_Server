import 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiHttp);
chai.use(chaiAsPromised);

import server, { app, sequelize } from '../server';
export default app;

before(async () => {
    // Wait for server to start
    await server;

    // Drop and resync tables
    await sequelize.drop({ cascade: true });
    await sequelize.sync();
});

// Import tests
import './unit';
import './integration';

// Stop server
after(done => {
    app.listen(process.env.PORT).close();
    done();
});
