import { expect, request } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { res, next } from '../index';

import models from '../../../models';

describe('Unit - Navigation', () => {
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
                findById: (_: number) => {
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

        // Expect error
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
        const session = {};
        const req = {
            userID: 2,
            params: {
                sessionID: 1
            },
            session: {
                id: 1,
                APId: 2,
                carerId: 3,
                carerHasControl: true
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

        // Verify the send message call
        // First argument: ID of carer
        // Second argument: ID of session
        // Third argument: name of AP
        expect(sendSpy.calledOnce).to.equal(true);
        expect(
            sendSpy.alwaysCalledWith(
                req.session.carerId,
                req.session.id,
                AP_NAME
            )
        ).to.equal(true);
    });
});
