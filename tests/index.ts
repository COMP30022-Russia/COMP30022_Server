import 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

// Start app
import server, { app, sequelize } from '../server';
export default app;

before(async () => {
    // Wait for server to start
    await server;
    // Drop and resync tables
    await sequelize.drop();
    await sequelize.sync();
});

// Import (and run) tests
import './home';
import './user';

// Stop server
after(done => {
    app.listen(process.env.PORT || 5000).close();
    sequelize.close().then(() => {
        console.log('Server ended');
    });
    done();
});
