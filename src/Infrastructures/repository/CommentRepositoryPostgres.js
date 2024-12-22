const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyComment(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: `SELECT id 
            FROM comments 
            WHERE id = $1 and owner = $2`,
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('akses comment tidak tersedia');
    }
  }

  async addComment(addComment, threadId, owner) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, isDelete, threadId, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async getComments(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.date, c.content
            FROM comments as c
            INNER JOIN users as u ON c.owner = u.id
            WHERE c.thread_id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
