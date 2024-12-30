const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyReply function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply('thred-not-exist')).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('should not throw Error when reply found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply('reply-123')).resolves.not.toThrowError(
        NotFoundError,
      );
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when user is not reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-234', username: 'other_user' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-234'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw Error when user is reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const addReply = new AddReply({
        content: 'sebuah reply',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(addReply, commentId, owner);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({
        id: 'reply-123',
        content: addReply.content,
        is_delete: false,
        comment_id: commentId,
        owner,
      });
      expect(replies[0].date).toBeDefined();
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const addReply = new AddReply({
        content: 'sebuah reply',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply, commentId, owner);
      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: addReply.content,
          owner,
        }),
      );
    });
  });

  describe('getReplies function', () => {
    it('should return reply', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const stubReply = {
        id: 'reply-123',
        content: 'sebuah reply',
        is_delete: false,
        comment_id: commentId,
        owner,
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply(stubReply);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplies(commentId);

      // Assert
      expect(replies).toHaveLength(1);
      const users = await UsersTableTestHelper.findUsersById(owner);
      expect(replies[0]).toEqual({
        id: stubReply.id,
        content: stubReply.content,
        date: stubReply.date,
        username: users[0].username,
        is_delete: false,
      });
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return replies', async () => {
      // Arrange
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentIdA = 'comment-123';
      const commentIdB = 'comment-234';
      const stubReplyA = {
        id: 'reply-123',
        content: 'sebuah reply 1',
        is_delete: false,
        comment_id: commentIdA,
        owner,
        date: new Date().toISOString(),
      };
      await sleep(100);
      const stubReplyB = {
        id: 'reply-234',
        content: 'sebuah reply 2',
        is_delete: false,
        comment_id: commentIdB,
        owner,
        date: new Date().toISOString(),
      };
      await sleep(100);
      const stubReplyC = {
        id: 'reply-345',
        content: 'sebuah reply 3',
        is_delete: false,
        comment_id: commentIdB,
        owner,
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentIdA });
      await CommentsTableTestHelper.addComment({ id: commentIdB });
      await RepliesTableTestHelper.addReply(stubReplyA);
      await RepliesTableTestHelper.addReply(stubReplyB);
      await RepliesTableTestHelper.addReply(stubReplyC);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([
        commentIdA,
        commentIdB,
      ]);

      // Assert
      expect(replies).toHaveLength(3);
      const users = await UsersTableTestHelper.findUsersById(owner);
      expect(replies[0]).toEqual({
        id: stubReplyA.id,
        content: stubReplyA.content,
        date: stubReplyA.date,
        username: users[0].username,
        is_delete: false,
        comment_id: commentIdA,
      });
      expect(replies[1]).toEqual({
        id: stubReplyB.id,
        content: stubReplyB.content,
        date: stubReplyB.date,
        username: users[0].username,
        is_delete: false,
        comment_id: commentIdB,
      });
      expect(replies[2]).toEqual({
        id: stubReplyC.id,
        content: stubReplyC.content,
        date: stubReplyC.date,
        username: users[0].username,
        is_delete: false,
        comment_id: commentIdB,
      });
    });
  });

  describe('deleteReply function', () => {
    it('should change is_delete comment to true', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const stubReply = {
        id: 'reply-123',
        content: 'sebuah reply',
        is_delete: false,
        comment_id: commentId,
        owner,
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply(stubReply);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(stubReply.id);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(stubReply.id);
      expect(replies[0].is_delete).toEqual(true);
    });
  });
});
