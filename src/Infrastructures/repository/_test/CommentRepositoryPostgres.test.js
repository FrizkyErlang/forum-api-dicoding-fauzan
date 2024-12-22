const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyComment('thred-not-exist')).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('should not throw Error when comment found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyComment('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when user is not comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-234', username: 'other_user' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-234'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw Error when user is comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const addComment = new AddComment({
        content: 'sebuah commment',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, threadId, owner);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0]).toMatchObject({
        id: 'comment-123',
        content: addComment.content,
        is_delete: false,
        thread_id: threadId,
        owner,
      });
      expect(comments[0].date).toBeDefined();
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const addComment = new AddComment({
        content: 'sebuah commment',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment, threadId, owner);
      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: addComment.content,
          owner,
        }),
      );
    });
  });

  describe('getComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const stubComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        is_delete: false,
        thread_id: threadId,
        owner,
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment(stubComment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getComment(stubComment.id);

      // Assert
      const users = await UsersTableTestHelper.findUsersById(owner);
      expect(comment).toEqual({
        id: stubComment.id,
        username: users[0].username,
        content: stubComment.content,
        date: stubComment.date,
      });
    });
  });

  describe('deleteComment function', () => {
    it('should change is_delete comment to true', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const stubComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        is_delete: false,
        thread_id: threadId,
        owner,
        date: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment(stubComment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(stubComment.id);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(stubComment.id);
      expect(comments[0].is_delete).toEqual(true);
    });
  });
});
