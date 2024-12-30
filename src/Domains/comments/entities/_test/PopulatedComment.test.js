const PopulatedComment = require('../PopulatedComment');

describe('a PopulatedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
    };

    const replies = [];

    // Action and Assert
    expect(() => new PopulatedComment(payload, replies, 3)).toThrowError(
      'POPULATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      username: [],
      date: {},
      is_delete: 'sasa',
    };

    const replies = [];

    // Action and Assert
    expect(() => new PopulatedComment(payload, replies, 3)).toThrowError(
      'POPULATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create populatedComment object correctly when deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
      is_delete: true,
    };

    const stubReplies = [];

    // Action
    const { id, content, username, date, replies, likeCount } = new PopulatedComment(
      payload,
      stubReplies,
      3,
    );

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(replies).toHaveLength(0);
    expect(likeCount).toEqual(3);
  });

  it('should create populatedComment object correctly when no replies', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
      is_delete: false,
    };

    const stubReplies = [];

    // Action
    const { id, content, username, date, replies, likeCount } = new PopulatedComment(
      payload,
      stubReplies,
      3,
    );

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(likeCount).toEqual(3);
    expect(replies).toHaveLength(0);
  });

  it('should create populatedComment object correctly when have replies with correct comment_id', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
      is_delete: false,
    };

    const stubReplies = [
      {
        id: 'reply-123',
        content: 'sebuah reply',
        username: 'user-123',
        date: '2024-12-30T12:44:35.634Z',
      },
    ];

    // Action
    const { id, content, username, date, replies, likeCount } = new PopulatedComment(
      payload,
      stubReplies,
      3,
    );

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(likeCount).toEqual(3);
    expect(replies).toHaveLength(1);
    expect(replies[0]).toEqual({
      id: 'reply-123',
      date: '2024-12-30T12:44:35.634Z',
      content: 'sebuah reply',
      username: 'user-123',
    });
  });
});
