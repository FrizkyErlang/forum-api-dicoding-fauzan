class PopulatedThread {
  constructor(payload, comments) {
    this._verifyPayload(payload);

    const { id, title, body, username, date } = payload;

    this.id = id;

    this.title = title;

    this.body = body;

    this.username = username;

    this.date = date;

    this.comments = comments;
  }

  _verifyPayload({ id, title, body, username, date }) {
    if (!id || !title || !body || !username || !date) {
      throw new Error('POPULATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof username !== 'string'
    ) {
      throw new Error('POPULATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PopulatedThread;
