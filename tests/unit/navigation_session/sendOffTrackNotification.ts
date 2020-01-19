import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';

describe('Navigation', () => {
    const sandbox = sinon.createSandbox();

    // Navigation session controller
    let navigation: any;

    // Spy for Firebase send message call
    const sendSpy = sinon.spy();

    const AP_NAME = 'foo';

    before(async () => {
        // Import the nav controller with a spy on the notification function
        navigation = proxyquire('../../../controllers/navigation_session', {
            './notification/navigation': {
                sendOffTrackMessage: sendSpy
            }
        });

        // Replace find name call
        sandbox.replace(models.User, 'scope', (_: string) => {
            return {
                findByPk: (__: number) => {
                    return { name: AP_NAME };
                }
            };
        });
    });

    after(async () => {
        sandbox.restore();
    });

    it('Off-track notification as non AP user', async () => {
        const req = {
            userID: 3,
            params: {
                sessionID: 1
            },
            session: {
                id: 1,
                APId: 2,
                carerId: 3
            }
        };

        // @ts-ignore
        const result = await navigation.sendOffTrackNotification(
            req,
            res,
            next
        );
        expect(result).to.be.an('error');
        expect(result.message).to.equal(
            'Non AP users are not allowed to send off-track notifications'
        );
    });

    it('Off-track notification', async () => {
        const updateSpy: any = sinon.spy(() => req.session.sync++);
        const sync = 8;
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: {
                id: 1,
                APId: 2,
                carerId: 3,
                carerHasControl: true,
                sync,
                update: updateSpy
            }
        };

        // Expect success message to be returned
        // @ts-ignore
        const result = await navigation.sendOffTrackNotification(
            req,
            res,
            next
        );
        expect(result).to.have.property('status');
        expect(result.status).to.equal('success');

        // Check update
        expect(updateSpy.calledOnce).to.equal(true);
        expect(updateSpy.lastCall.args[0]).to.deep.equal({ sync: sync + 1 });

        // Verify the send message call
        // First argument: ID of carer
        // Second argument: ID of session
        // Third argument: name of AP
        // Fourth argument: sync
        expect(sendSpy.calledOnce).to.equal(true);
        expect(sendSpy.lastCall.args).to.have.lengthOf(4);
        expect(sendSpy.lastCall.args[0]).to.equal(req.session.carerId);
        expect(sendSpy.lastCall.args[1]).to.equal(req.session.id);
        expect(sendSpy.lastCall.args[2]).to.equal(AP_NAME);
        expect(sendSpy.lastCall.args[3]).to.equal(sync + 1);
    });
});
