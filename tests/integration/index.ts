// Import tests
import './socket';
import './home';

import './auth/login';
import './auth/logout';
import './auth/register';

import './notification/getTokens';
import './notification/updateToken';

import './association/association';
import './location/location';

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

import './destination/destination';

import './chat/createMessage';
import './chat/getMessages';

import './chat_picture/createPictureMessage';
import './chat_picture/getMessagePicture';
import './chat_picture/uploadPicture';

import './emergency/getEmergencyEvent';
import './emergency/handleEmergencyEvent';
import './emergency/initiateEmergencyEvent';

import './call/acceptCall';
import './call/endCall';
import './call/getCall';
import './call/getNav';
import './call/rejectCall';
import './call/setCallState';
import './call/startNavigationCall';
import './call/updateCallFailureCount';
