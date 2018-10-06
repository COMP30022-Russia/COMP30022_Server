import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';
import { Op } from 'sequelize';

import models from '../../../models';

describe('Unit - Navigation call', () => {
    const sandbox = sinon.createSandbox();
    const sendSpy = sinon.spy();
    let navigation: any;

    before(async () => {
        // Spy on message sending
        navigation = proxyquire('../../../controllers/navigation', {
            './notification/call': {
                sendNavigationCallRequestStartMessage: sendSpy
            }
        });
    });

    beforeEach(async () => {
        // Replace create call
        sandbox.replace(models.Call, 'create', (properties: any) => {
            return { ...properties, id: 5 };
        });

        // Replace name call
        sandbox.replace(models.User, 'scope', (_: any) => {
            return {
                findById: (_: number) => {
                    return { name: 'foo' };
                }
            };
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Existing navigation voice call', async () => {
        const req: any = {
            session: { id: 0, APId: 0 }
        };

        // Replace find call
        sandbox.replace(models.Call, 'findOne', sinon.fake.returns({}));

        // @ts-ignore
        const result = await navigation.startNavigationCall(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'There is pre-existing non-terminated voice/video call'
        );
    });

    it('New navigation voice call', async () => {
        const req: any = {
            userID: 10,
            session: { id: 1, APId: 10, carerId: 11 }
        };

        // Replace find call
        // tslint:disable:no-null-keyword / DB will return null here
        sandbox.replace(models.Call, 'findOne', sinon.fake.returns(null));

        // @ts-ignore
        const result = await navigation.startNavigationCall(req, res, next);
        expect(result).to.have.property('id');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('carerId');
        expect(result).to.have.property('sessionId');
        expect(result.id).to.equal(5);
        expect(result.APId).to.equal(req.session.APId);
        expect(result.carerId).to.equal(req.session.carerId);
        expect(result.sessionId).to.equal(req.session.id);

        // Check send message call
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.length(5);
        expect(sendSpy.lastCall.args[0]).to.equal(result.id);
        expect(sendSpy.lastCall.args[1]).to.equal(req.session.id);
        expect(sendSpy.lastCall.args[2]).to.equal('foo');
        expect(sendSpy.lastCall.args[3]).to.equal(req.userID);
        expect(sendSpy.lastCall.args[4]).to.equal(req.session.carerId);
    });
});
