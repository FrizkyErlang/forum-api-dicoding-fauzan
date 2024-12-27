const LikesRepository = require('../../../Domains/likes/LikesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const SetLikeCommentUseCase = require('../SetLikeCommentUseCase');

describe('SetLikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the set like action correctly when no like', async () => {
    // Arrange

    /** creating dependency of use case */
    const mockLikeRepository = new LikesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockLikeRepository.verifyLikedComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new SetLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addCommentUseCase.execute('thread-123', 'comment-123', 'user-123');

    // Assert
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyComment).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyComment).toBeCalledWith('comment-123');
    expect(mockLikeRepository.verifyLikedComment).toBeCalledTimes(1);
    expect(mockLikeRepository.verifyLikedComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLike).toBeCalledTimes(1);
    expect(mockLikeRepository.addLike).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLike).toBeCalledTimes(0);
  });

  it('should orchestrating the set like action correctly when have like', async () => {
    // Arrange

    /** creating dependency of use case */
    const mockLikeRepository = new LikesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockLikeRepository.verifyLikedComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.addLike = jest.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new SetLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addCommentUseCase.execute('thread-123', 'comment-123', 'user-123');

    // Assert
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyComment).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyComment).toBeCalledWith('comment-123');
    expect(mockLikeRepository.verifyLikedComment).toBeCalledTimes(1);
    expect(mockLikeRepository.verifyLikedComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLike).toBeCalledTimes(0);
    expect(mockLikeRepository.deleteLike).toBeCalledTimes(1);
    expect(mockLikeRepository.deleteLike).toBeCalledWith('comment-123', 'user-123');
  });
});
