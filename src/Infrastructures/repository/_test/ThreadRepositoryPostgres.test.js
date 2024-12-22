const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThread('thred-not-exist')).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('should not throw Error when thread found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThread('thread-123')).resolves.not.toThrowError(
        NotFoundError,
      );
    });
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      // Arrange
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0]).toMatchObject({
        id: 'thread-123',
        title: addThread.title,
        body: addThread.body,
        owner,
      });
      expect(threads[0].date).toBeDefined();
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, owner);
      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: addThread.title,
          owner,
        }),
      );
    });
  });

  describe('getThread function', () => {
    it('should return thread', async () => {
      // Arrange
      const owner = 'user-123';
      const stubThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date().toISOString(),
        owner,
      };
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread(stubThread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThread(stubThread.id);

      // Assert
      const users = await UsersTableTestHelper.findUsersById(owner);
      expect(thread).toEqual({
        id: stubThread.id,
        title: stubThread.title,
        body: stubThread.body,
        date: stubThread.date,
        username: users[0].username,
      });
    });
  });
});
