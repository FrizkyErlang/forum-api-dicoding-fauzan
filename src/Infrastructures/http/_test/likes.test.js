const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200', async () => {
      // Arrange
      const stubUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const stubLogin = {
        username: 'dicoding',
        password: 'secret',
      };
      const stubThread = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const stubComment = {
        content: 'sebuah comment',
      };
      const server = await createServer(container);

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: stubUser,
      });
      /** login */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: stubLogin,
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);
      /** add thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: stubThread,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);
      /** add comment */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: stubComment,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson).toBeDefined();
    });

    it('should response 401 if no accessToken', async () => {
      // Arrange
      const stubUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const stubLogin = {
        username: 'dicoding',
        password: 'secret',
      };
      const stubThread = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const stubComment = {
        content: 'sebuah comment',
      };
      const server = await createServer(container);

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: stubUser,
      });
      /** login */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: stubLogin,
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);
      /** add thread */
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: stubThread,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);
      /** add comment */
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: stubComment,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });
  });
});
