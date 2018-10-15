import sinon, { SinonStub, SinonSpy, SinonFake } from 'sinon';

// Import tests
import './models/user';
import './helpers/jwt';
import './helpers/cron';

import './middleware/associated';
import './middleware/association';
import './middleware/authenticate';
import './middleware/call';
import './middleware/emergency';
import './middleware/navigation';
import './middleware/params';

import './notification/build';
import './notification/getFirebaseTokens';
import './notification/updateFirebaseToken';

import './auth/login';
import './auth/logout';
import './auth/register';

import './association/createAssociation';
import './association/getAssociation';
import './association/getAssociations';
import './association/getAssociationToken';

import './location/getSelfLocation';
import './location/getUserLocation';
import './location/setSelfLocation';

import './user/getAssociatedUserDetails';
import './user/getSelfDetails';
import './user/updateUserDetails';

import './user_picture/getProfilePicture';
import './user_picture/setProfilePicture';

import './navigation/endNavigationSession';
import './navigation/getNavigationSession';
import './navigation/getSelfNavigationSession';
import './navigation/startNavigationSession';

import './navigation_session/getAPLocation';
import './navigation_session/getRoute';
import './navigation_session/sendOffTrackNotification';
import './navigation_session/setDestination';
import './navigation_session/switchNavigationControl';
import './navigation_session/updateAPLocation';

import './chat/createMessage';
import './chat/getMessages';
import './chat_picture/createPictureMessage';
import './chat_picture/getMessagePicture';
import './chat_picture/uploadPicture';

import './destination/getDestinations';
import './destination/setFavouriteDestination';

import './emergency/getEmergencyEvent';
import './emergency/handleEmergencyEvent';
import './emergency/initiateEmergencyEvent';

import './call/acceptCall';
import './call/endCall';
import './call/rejectCall';
import './call/setCallState';
import './call/startNavigationCall';
import './call/updateCallFailureCount';

// Define res
const res = {
    // Define res.json stub to return first argument
    json: sinon.stub().returnsArg(0),
    // Define res.status fake
    status: sinon.fake()
};

// Define next
const next = sinon.stub().returnsArg(0);

/**
 * Wraps object with toJSON function.
 * @param {Object} obj An object.
 * @return Object with toJSON function which returns object.
 */
const wrapToJSON = (obj: any) => {
    return {
        ...obj,
        toJSON: () => obj
    };
};

export { res, next, wrapToJSON };
