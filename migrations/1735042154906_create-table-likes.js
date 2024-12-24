exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.createIndex('likes', 'user_id');

  pgm.addConstraint(
    'likes',
    'fk_likes.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.createIndex('likes', 'comment_id');

  pgm.addConstraint(
    'likes',
    'fk_likes.comment_id_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comments.id');

  pgm.dropIndex('likes', 'comment_id');

  pgm.dropConstraint('likes', 'fk_likes.user_id_users.id');

  pgm.dropIndex('likes', 'user_id');

  pgm.dropIndex('likes', 'is_delete');

  pgm.dropTable('likes');
};
