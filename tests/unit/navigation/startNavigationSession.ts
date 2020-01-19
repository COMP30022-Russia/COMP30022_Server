import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next, wrapToJSON } from '../index';

import models from '../../../models';

describe('Navigation - Start navigation session', () => {
    const sandbox = sinon.createSandbox();

    // Navigation controller
    let navigation: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    before(async () => {
        // Import the nav controller with a spy on the notification function
        navigation = proxyquire('../../../controllers/navigation', {
            './notification/navigation': { sendNavigationStartMessage: sendSpy }
        });
    });

    beforeEach(async () => {
        // Fake name query
        sandbox.replace(models.User, 'scope', (scope: any) => {
            return {
                findByPk: (id: number) => {
                    return { name: 'A name' };
                }
            };
        });
    });

    afterEach(async () => {
        sandbox.restore();
    });

    it('Start session as AP', async () => {
        // Need association to start navigation session
        const req = {
            userID: 1,
            association: {
                id: 5,
                APId: 1,
                carerId: 2
            }
        };

        // Return null to indicate that carer/AP are not in session
        const inSessionStub = sinon.stub();
        // tslint:disable:no-null-keyword / DB will return null here
        inSessionStub.onCall(0).returns(null);
        inSessionStub.onCall(1).returns(null);
        sandbox.replace(models.Session, 'findOne', inSessionStub);

        sandbox.replace(models.Session, 'create', (arg: any) => {
            return wrapToJSON({ ...arg, id: 50, sync: 1 });
        });

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.startNavigationSession(req, res, next);
        expect(result).to.have.property('carerId');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('carerHasControl');
        expect(result.carerId).to.equal(req.association.carerId);
        expect(result.APId).to.equal(req.association.APId);
        expect(result.carerHasControl).to.equal(false);

        // Verify the send message call
        // First argument: Name of self
        // Second argument: ID of opposite party
        // Third argument: ID of association
        // Fourth argument: ID of session
        // Fifth argument: Sync
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(
                'A name',
                req.association.carerId,
                req.association.id,
                50,
                1
            )
        ).to.equal(true);
    });

    it('Start session as Carer', async () => {
        // Need association to start navigation session
        const req = {
            userID: 1,
            association: {
                APId: 2,
                carerId: 1
            }
        };

        // Return null to indicate that carer/AP are not in session
        const inSessionStub = sinon.stub();
        // tslint:disable:no-null-keyword / DB will return null here
        inSessionStub.onCall(0).returns(null);
        inSessionStub.onCall(1).returns(null);
        sandbox.replace(models.Session, 'findOne', inSessionStub);

        sandbox.replace(models.Session, 'create', (session: any) => {
            return wrapToJSON(session);
        });

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.startNavigationSession(req, res, next);
        expect(result).to.have.property('carerId');
        expect(result).to.have.property('APId');
        expect(result).to.have.property('carerHasControl');
        expect(result.carerId).to.equal(req.association.carerId);
        expect(result.APId).to.equal(req.association.APId);
        expect(result.carerHasControl).to.equal(true);
    });

    it('Start session with AP in active session', async () => {
        // Need association to start navigation session
        const req = {
            userID: 1,
            association: {
                APId: 2,
                carerId: 1
            }
        };

        // Return id in one of the queries
        const inSessionStub = sinon.stub();
        // tslint:disable:no-null-keyword / DB will return null here
        inSessionStub.onCall(0).returns({ id: 1 });
        inSessionStub.onCall(1).returns(null);
        sandbox.replace(models.Session, 'findOne', inSessionStub);

        // Expect result to be error
        // @ts-ignore
        const result = await navigation.startNavigationSession(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Cannot start navigation session, user(s) are in session'
        );
    });

    it('Start session with carer in active session', async () => {
        // Need association to start navigation session
        const req = {
            userID: 1,
            association: {
                APId: 2,
                carerId: 1
            }
        };

        // Return id in one of the queries
        const inSessionStub = sinon.stub();
        // tslint:disable:no-null-keyword / DB will return null here
        inSessionStub.onCall(0).returns(null);
        inSessionStub.onCall(1).returns({ id: 1 });
        sandbox.replace(models.Session, 'findOne', inSessionStub);

        // Expect result to be error
        // @ts-ignore
        const result = await navigation.startNavigationSession(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Cannot start navigation session, user(s) are in session'
        );
    });
});
