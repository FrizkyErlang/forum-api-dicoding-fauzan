const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute('comment-123', 'thread-123', 'user-123');

    // Assert
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyComment).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyComment).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment).toBeCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toBeCalledWith('comment-123');
  });
});
