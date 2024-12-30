const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikesRepository = require('../../../Domains/likes/LikesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const date = new Date();
    const mockReplies = [
      {
        id: 'reply-123',
        date,
        content: 'sebuah reply 1',
        username: 'john doe',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-234',
        date,
        content: 'sebuah reply 2',
        username: 'jane doe',
        comment_id: 'comment-123',
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
    const mockLikesRepository = new LikesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    mockLikesRepository.countLike = jest.fn().mockImplementation(() => Promise.resolve(1));
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
      likeRepository: mockLikesRepository,
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
          likeCount: 1,
        },
      ],
    });
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledTimes(1);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123']);
    expect(mockCommentRepository.getComments).toBeCalledTimes(1);
    expect(mockCommentRepository.getComments).toBeCalledWith('thread-123');
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThread).toBeCalledTimes(1);
    expect(mockThreadRepository.getThread).toBeCalledWith('thread-123');
  });

  it("should orchestrating the get detail thread action correctly when there's deleted comment or reply", async () => {
    // Arrange
    const date = new Date();
    const mockReplies = [
      {
        id: 'reply-123',
        date,
        content: 'sebuah reply 1',
        username: 'john doe',
        comment_id: 'comment-123',
        is_delete: true,
      },
      {
        id: 'reply-234',
        date,
        content: 'sebuah reply 2',
        username: 'jane doe',
        comment_id: 'comment-123',
        is_delete: false,
      },
    ];
    const mockComments = [
      {
        id: 'comment-123',
        username: 'jean doe',
        date,
        content: 'sebuah comment',
        is_delete: true,
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
    const mockLikesRepository = new LikesRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    mockLikesRepository.countLike = jest.fn().mockImplementation(() => Promise.resolve(1));
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
      likeRepository: mockLikesRepository,
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
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-123',
              date,
              content: '**balasan telah dihapus**',
              username: 'john doe',
            },
            {
              id: 'reply-234',
              date,
              content: 'sebuah reply 2',
              username: 'jane doe',
            },
          ],
          likeCount: 1,
        },
      ],
    });
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledTimes(1);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123']);
    expect(mockCommentRepository.getComments).toBeCalledTimes(1);
    expect(mockCommentRepository.getComments).toBeCalledWith('thread-123');
    expect(mockThreadRepository.verifyThread).toBeCalledTimes(1);
    expect(mockThreadRepository.verifyThread).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThread).toBeCalledTimes(1);
    expect(mockThreadRepository.getThread).toBeCalledWith('thread-123');
  });
});
