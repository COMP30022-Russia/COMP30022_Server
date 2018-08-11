import { expect, request } from 'chai';
import app from './';

describe('Home', () => {
    const agent = request.agent(app);

    it('Get home page', async () => {
        const res = await agent.get('/');
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('name');
        expect(res.body.name).to.equal('Team Russia Server');
    });
});
