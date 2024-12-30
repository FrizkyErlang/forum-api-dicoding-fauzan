const LikesRepository = require('../../Domains/likes/LikesRepository');

class LikeRepositoryPostgres extends LikesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyLikedComment(commentId, userId) {
    const query = {
      text: `SELECT * 
            FROM likes 
            WHERE comment_id = $1 AND user_id = $2`,
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rowCount !== 0;
  }

  async addLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    this._pool.query(query);
  }

  async deleteLike(commentId, userId) {
    const query = {
      text: `DELETE FROM likes 
            WHERE comment_id = $1 AND user_id = $2`,
      values: [commentId, userId],
    };

    this._pool.query(query);
  }

  async countLike(commentId) {
    const query = {
      text: `SELECT * 
            FROM likes 
            WHERE comment_id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async countLikeByCommentIds(commentIds) {
    const query = {
      text: `SELECT comment_id, CAST(COUNT(*) as INTEGER) as like_count 
            FROM likes 
            WHERE comment_id = ANY($1::text[])
            GROUP BY comment_id
            ORDER BY comment_id asc`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
