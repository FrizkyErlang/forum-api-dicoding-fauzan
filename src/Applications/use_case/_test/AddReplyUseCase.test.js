const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah reply',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));
    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addCommentUseCase.execute(
      useCasePayload,
      'comment-123',
      'thread-123',
      'user-123',
    );

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: 'user-123',
      }),
    );
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyComment).toBeCalledTimes(1);
    expect(mockCommentRepository.verifyComment).toBeCalledWith('comment-123');
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
      }),
      'comment-123',
      'user-123',
    );
  });
});
