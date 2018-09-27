import sinon, { SinonStub, SinonSpy, SinonFake } from 'sinon';

// Import tests
import './models/user';
import './helpers';
import './notification';
import './middleware';

import './auth';
import './association';
import './location';
import './user';
import './user_picture';
import './navigation';
import './navigation_session';
import './chat';
import './chat_picture';

// Define res.json stub to return first argument
const resJSONStub: SinonStub = sinon.stub().returnsArg(0);

// Define res.status fake
const resStatus: SinonSpy = sinon.fake();

// Define res
const res = {
    json: resJSONStub,
    status: resStatus
};

// Define next
const next = sinon.stub().returnsArg(0);

export { res, next };
