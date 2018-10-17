import { expect, request } from 'chai';
import io from 'socket.io-client';

import app from '../';
import { sendServerMessage } from '../../socket';

// Define agent
const agent = request.agent(app);

// Define socket URL
const SERVER_URL = `http://localhost:${process.env.PORT}/socket`;

it('Socket connection', function(done) {
    const socket = io.connect(
        SERVER_URL,
        { query: { firebase_token: 'foo:bar', auth_token: 'secret' } }
    );

    socket.on('connect', async () => {
        // Send message
        await sendServerMessage(['foo:bar'], '{}');
    });
    socket.on('data_message', (data: string) => {
        // Verify message
        expect(data).to.equal('{}');
        socket.close();
    });
    socket.on('disconnect', () => {
        done();
    });
});

it('Socket connection - with message of other user', function(done) {
    const socket = io.connect(
        SERVER_URL,
        { query: { firebase_token: 'foo:bar', auth_token: 'secret' } }
    );

    socket.on('connect', async () => {
        // Send message for other user
        await sendServerMessage(['bar:bar'], '{}');
        await new Promise(resolve => setTimeout(resolve, 250));
        await sendServerMessage(['foo:bar'], '{}');
    });
    socket.on('data_message', (data: string) => {
        // Verify message
        expect(data).to.equal('{}');
        socket.close();
    });
    socket.on('disconnect', () => {
        done();
    });
});

it('Bad socket connection - missing auth', function(done) {
    // Connect with missing auth token
    const socket = io.connect(
        SERVER_URL,
        { query: { firebase_token: 'foo:bar' } }
    );
    socket.on('error', () => {
        done();
    });
});
