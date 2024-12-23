const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
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
      const requestPayload = {
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 if body not complete', async () => {
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
      const requestPayload = {};
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 if thread not found', async () => {
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
      const requestPayload = {
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-123/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
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
      const requestPayload = {
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
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
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  it('should response 404 when comment not found', async () => {
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

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${addedThread.id}/comments/comment-123`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toBeDefined();
  });

  it('should response 404 when thread not found', async () => {
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

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/thread-123/comments/comment-123`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toBeDefined();
  });

  it('should response 403 when not owner', async () => {
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
    const stubUserOther = {
      username: 'dicoding1',
      password: 'secret',
      fullname: 'Dicoding Indonesia1',
    };
    const stubLoginOther = {
      username: 'dicoding1',
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
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: stubUserOther,
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
    const loginResponseOther = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: stubLoginOther,
    });
    const {
      data: { accessToken: accessTokenOther },
    } = JSON.parse(loginResponseOther.payload);
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
      method: 'DELETE',
      url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
      headers: { Authorization: `Bearer ${accessTokenOther}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(403);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toBeDefined();
  });

  it('should response 401 when no accessToken', async () => {
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
      method: 'DELETE',
      url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(401);
    expect(responseJson.message).toBeDefined();
  });
});
