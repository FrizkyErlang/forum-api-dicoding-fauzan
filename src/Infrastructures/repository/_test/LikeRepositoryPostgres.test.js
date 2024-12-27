const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyLikedComment function', () => {
    it('should return false when comment not liked', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        likeRepositoryPostgres.verifyLikedComment('comment-not-exist', 'user-not-exist'),
      ).resolves.toBeFalsy();
    });

    it('should return true when comment liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        likeRepositoryPostgres.verifyLikedComment('comment-123', 'user-123'),
      ).resolves.toBeTruthy();
    });
  });

  describe('addLike function', () => {
    it('should persist like for comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0]).toMatchObject({
        id: 'like-123',
        comment_id: 'comment-123',
        user_id: 'user-123',
      });
    });
  });

  describe('deleteLike function', () => {
    it('should delete like for comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikesById('reply-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('countLike function', () => {
    it('should return like(s) count for comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user1' });
      await UsersTableTestHelper.addUser({ id: 'user-234', username: 'user2' });
      await UsersTableTestHelper.addUser({ id: 'user-345', username: 'user3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-234',
        commentId: 'comment-123',
        userId: 'user-234',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-345',
        commentId: 'comment-123',
        userId: 'user-345',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likesCount = await likeRepositoryPostgres.countLike('comment-123');

      // Assert
      expect(likesCount).toEqual(3);
    });
  });
});
