import { expect, request } from 'chai';
import sinon from 'sinon';
import { res, next } from '../index';

import { register } from '../../../controllers/auth';
import models from '../../../models';

describe('Unit - User - Register', () => {
    const sandbox = sinon.createSandbox();
    const defaultReturnVal = { cool: 'object' };

    before(async () => {
        // Fake DB call
        const dbFake = sinon.fake.returns({
            ...defaultReturnVal,
            toJSON: () => {
                return defaultReturnVal;
            }
        });
        sandbox.replace(models.User, 'create', dbFake);
    });

    it('Carer', async () => {
        const req: any = {
            body: {
                name: 'Person 1',
                username: 'p1',
                password: 'p1',
                DOB: '1997-08-25',
                mobileNumber: '0',
                type: 'Carer'
            }
        };

        // @ts-ignore
        const result = await register(req, res, next);
        expect(result).to.equal(defaultReturnVal);
    });

    it('AP', async () => {
        const req: any = {
            body: {
                name: 'Person 1',
                username: 'p1',
                password: 'p1',
                DOB: '1997-08-25',
                mobileNumber: '0',
                type: 'AP',
                emergencyContactName: '1',
                emergencyContactNumber: '1'
            }
        };

        // @ts-ignore
        const result = await register(req, res, next);
        expect(result).to.equal(defaultReturnVal);
    });

    it('AP without emergency contact', async () => {
        const req: any = {
            body: {
                name: 'Person 1',
                username: 'p1',
                password: 'p1',
                DOB: '1997-08-25',
                mobileNumber: '0',
                type: 'AP'
            }
        };

        // @ts-ignore
        const result = await register(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.be.equal('Missing emergency contact details');
    });

    it('Without required fields', async () => {
        sandbox.restore();

        // Fake DB call
        const dbFake = sinon.fake.throws('DB validation failure');
        sandbox.replace(models.User, 'create', dbFake);

        // If there are missing fields, ORM should reject promise
        const req: any = {
            body: {
                type: 'Carer'
            }
        };

        // @ts-ignore
        const result = await register(req, res, next);
        expect(result).to.be.an('error');
        expect(result.message).to.be.equal('DB validation failure');
    });

    after(async () => {
        sandbox.restore();
    });
});
