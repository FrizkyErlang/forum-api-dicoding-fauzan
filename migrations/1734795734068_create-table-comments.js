/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.createIndex('comments', 'is_delete');

  pgm.createIndex('comments', 'owner');

  pgm.addConstraint(
    'comments',
    'fk_comments.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.createIndex('comments', 'thread_id');

  pgm.addConstraint(
    'comments',
    'fk_comments.thread_id_threads.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'fk_comments.thread_id_threads.id');

  pgm.dropIndex('comments', 'thread_id');

  pgm.dropConstraint('comments', 'fk_comments.owner_users.id');

  pgm.dropIndex('comments', 'owner');

  pgm.dropIndex('comments', 'is_delete');

  pgm.dropTable('comments');
};
