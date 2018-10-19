import { expect } from 'chai';
import { res, next } from '../index';
import { getRoute } from '../../../controllers/navigation_session';

describe('Navigation', () => {
    it('Get route', async () => {
        const session = {
            route: {
                foo: 'bar',
                cool: 'route'
            }
        };
        const req = {
            userID: 1,
            params: {
                sessionID: 1
            },
            session
        };

        // Expect route to be returned
        // @ts-ignore
        const result = await getRoute(req, res, next);
        expect(result).to.deep.equal(session.route);
    });

    it('Get empty route', async () => {
        // tslint:disable:no-null-keyword / DB will return null here
        const req: any = {
            userID: 1,
            params: {
                sessionID: 1
            },
            session: {
                route: null
            }
        };

        // Expect route to be returned
        // @ts-ignore
        const result = await getRoute(req, res, next);
        expect(result).to.deep.equal({});
    });
});
