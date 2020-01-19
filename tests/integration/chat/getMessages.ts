import { expect, request } from 'chai';
import app from '../../';
import { createAP, createCarer, createAssociation } from '../helpers/user';

const creationAgent = request.agent(app);
/**
 * Creates a message as the specified user for the given association.
 * @param token Token of user
 * @param associationID ID of association
 * @param content Content of message
 * @return Created message
 */
const createMessageHelper = async (
    token: string,
    associationID: number,
    content: string
): Promise<any> => {
    const res = await creationAgent
        .post(`/associations/${associationID}` + '/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ content });
    return res.body;
};

describe('Chat', () => {
    const agent = request.agent(app);

    let apToken: string;
    let carerToken: string;
    let associationID: number;

    // Stores a sequence of created messages
    const messages: any = [];

    before(async () => {
        // Create AP, carer
        apToken = (await createAP('ca2')).token;
        carerToken = (await createCarer('cc2')).token;

        // Create association
        const association = await createAssociation(apToken, carerToken);
        associationID = association.id;

        // Create 15 messages
        for (const i of Array(15).keys()) {
            messages.push(
                await createMessageHelper(apToken, associationID, String(i))
            );
        }
    });

    it('Get all messages (without params)', async () => {
        const res = await agent
            .get(`/associations/${associationID}` + '/chat')
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('messages');
        expect(res.body.messages).to.have.lengthOf(10);
    });

    it('Get messages with limit', async () => {
        const res = await agent
            .get(`/associations/${associationID}` + '/chat?limit=2')
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('messages');
        expect(res.body.messages).to.have.lengthOf(2);
    });

    it('Get messages with before', async () => {
        const res = await agent
            .get(`/associations/${associationID}/chat?before=${messages[1].id}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('messages');
        expect(res.body.messages).to.have.lengthOf(1);
        expect(res.body.messages[0].id).to.equal(messages[0].id);
    });

    it('Get messages with after', async () => {
        const res = await agent
            .get(`/associations/${associationID}/chat?after=${messages[13].id}`)
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('messages');
        expect(res.body.messages).to.have.lengthOf(1);
        expect(res.body.messages[0].id).to.equal(messages[14].id);
    });

    it('Get messages with limit, before and after', async () => {
        const res = await agent
            .get(
                `/associations/${associationID}/chat?limit=15&before=${messages[14].id}&after=${messages[0].id}`
            )
            .set('Authorization', `Bearer ${apToken}`);
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('messages');
        expect(res.body.messages).to.have.lengthOf(13);
    });
});
