const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyReply(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: `SELECT id 
            FROM replies 
            WHERE id = $1 and owner = $2`,
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('akses reply tidak tersedia');
    }
  }

  async addReply(addReply, commentId, owner) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, isDelete, commentId, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async getReplies(commentId) {
    const query = {
      text: `SELECT r.id, r.date, r.content, u.username, r.is_delete
            FROM replies as r
            INNER JOIN users as u ON r.owner = u.id
            WHERE r.comment_id = $1
            ORDER BY r.date asc`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getRepliesByCommentIds(commentIds) {
    const query = {
      text: `SELECT r.id, r.date, r.content, u.username, r.is_delete, r.comment_id
            FROM replies as r
            INNER JOIN users as u ON r.owner = u.id
            WHERE r.comment_id = ANY($1::text[])
            ORDER BY r.comment_id asc, r.date asc`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
