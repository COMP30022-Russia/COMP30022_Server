import { expect, request } from 'chai';
import {
    buildDataMessage,
    buildAndroidNotificationMessage
} from '../../../controllers/notification';
import { appendToken } from '../../../notifications';

describe('Unit - Build Firebase Message', () => {
    it('Build data message', async () => {
        const payload = {
            hello: 'world'
        };
        const result = buildDataMessage('test', payload);
        expect(result).to.have.property('data');
        expect(result.data).to.have.property('type');
        expect(result.data.type).to.equal('test');
        expect(result.data).to.have.property('data');
        const payloadParsed = JSON.parse(result.data.data);
        expect(payloadParsed.hello).to.equal(payload.hello);
    });

    it('Build Android notification', async () => {
        const title = 'Hello';
        const body = 'World';

        const result = buildAndroidNotificationMessage(title, body);
        expect(result).to.have.property('android');
        expect(result.android).to.have.property('notification');
        expect(result.android.priority).to.equal('normal');
        expect(result.android.notification.title).to.equal(title);
        expect(result.android.notification.body).to.equal(body);
    });

    it('Append token', async () => {
        const orig = { foo: 'bar' };
        const token = 'cool';

        const result = appendToken(orig, token);
        expect(result).to.deep.equal({ ...orig, token });
    });
});
