import sinon, { SinonStub, SinonSpy, SinonFake } from 'sinon';

// Import tests
import './models/user';
import './helpers';
import './middleware';
import './accounts';
import './association';
import './location';
import './chat';

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
