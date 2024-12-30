const GetReply = require('../GetReply');

describe('a GetReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
    };

    const replies = [];

    // Action and Assert
    expect(() => new GetReply(payload, replies)).toThrowError(
      'GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
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
    expect(() => new GetReply(payload, replies)).toThrowError(
      'GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create getReply object correctly when deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah reply',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
      is_delete: true,
    };

    // Action
    const { id, content, username, date } = new GetReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual('**balasan telah dihapus**');
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
  });

  it('should create addedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah reply',
      username: 'user-123',
      date: '2024-12-30T12:44:35.634Z',
      is_delete: false,
    };

    // Action
    const { id, content, username, date } = new GetReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
  });
});
