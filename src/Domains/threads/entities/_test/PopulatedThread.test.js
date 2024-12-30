const PopulatedThread = require('../PopulatedThread');

describe('a PopulatedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-123',
    };

    const comments = [];

    // Action and Assert
    expect(() => new PopulatedThread(payload, comments)).toThrowError(
      'POPULATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      body: [],
      username: {},
      date: 'sasa',
    };

    const comments = [];

    // Action and Assert
    expect(() => new PopulatedThread(payload, comments)).toThrowError(
      'POPULATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create populatedThread object correctly when no comment', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
    };

    const stubComment = [];

    // Action
    const { id, title, body, username, date, comments } = new PopulatedThread(payload, stubComment);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(comments).toHaveLength(0);
  });

  it('should create populatedThread object correctly when have replies with correct comment_id', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
    };

    const stubComment = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        username: 'user-123',
        date: '2024-12-30T12:44:35.634Z',
        replies: [],
        likeCount: 0,
      },
    ];

    // Action
    const { id, title, body, username, date, comments } = new PopulatedThread(payload, stubComment);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toEqual({
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
      replies: [],
      likeCount: 0,
    });
  });
});
