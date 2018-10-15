import { expect, request } from 'chai';
import sinon from 'sinon';

import { cleanUpNavigationCalls } from '../../../controllers/navigation';
import { terminateIdlePendingCalls } from '../../../controllers/call';

describe('Unit - Cron', () => {
    it('Clean up navigation sessions', async () => {
        const result = await cleanUpNavigationCalls();
        expect(result).to.be.an('array');
    });

    it('Clean up pending calls', async () => {
        const result = await terminateIdlePendingCalls();
        expect(result).to.equal(undefined);
    });
});
