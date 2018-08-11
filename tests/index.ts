import 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

// Start app
import app from '../server';
export default app;

// Import (and run) tests
import './home';

// Stop server
after(done => {
    app.listen(process.env.PORT || 5000).close();
    done();
});
