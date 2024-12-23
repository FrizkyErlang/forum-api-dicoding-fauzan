const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const date = new Date();
    const mockReplies = [
      {
        id: 'reply-123',
        date,
        content: 'sebuah reply 1',
        username: 'john doe',
        is_delete: false,
      },
      {
        id: 'reply-234',
        date,
        content: 'sebuah reply 2',
        username: 'jane doe',
        is_delete: false,
      },
    ];
    const mockComments = [
      {
        id: 'comment-123',
        username: 'jean doe',
        date,
        content: 'sebuah comment',
        is_delete: false,
      },
    ];
    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date,
      username: 'jonathan doe',
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.getReplies = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    mockCommentRepository.getComments = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const Thread = await getDetailThreadUseCase.execute('thread-123');

    // Assert
    expect(Thread).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date,
      username: 'jonathan doe',
      comments: [
        {
          id: 'comment-123',
          username: 'jean doe',
          date,
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-123',
              date,
              content: 'sebuah reply 1',
              username: 'john doe',
            },
            {
              id: 'reply-234',
              date,
              content: 'sebuah reply 2',
              username: 'jane doe',
            },
          ],
        },
      ],
    });
    expect(mockReplyRepository.getReplies).toBeCalledTimes(1);
    expect(mockReplyRepository.getReplies).toBeCalledWith('comment-123');
    expect(mockCommentRepository.getComments).toBeCalledTimes(1);
    expect(mockCommentRepository.getComments).toBeCalledWith('thread-123');
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThread).toBeCalledTimes(1);
    expect(mockThreadRepository.getThread).toBeCalledWith('thread-123');
  });
});
