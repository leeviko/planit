/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = current_timestamp;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  pgm.createTable('users', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'varchar(255)',
      notNull: true,
    },
    admin: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createTable('boards', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    userId: {
      type: 'varchar(255)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    slug: {
      type: 'varchar(150)',
      notNull: true,
      unique: true,
    },
    title: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    favorited: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createTable('lists', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    boardId: {
      type: 'varchar(255)',
      notNull: true,
      references: '"boards"',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(100)',
      notNull: true,
    },
    position: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createTable('cards', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    listId: {
      type: 'varchar(255)',
      notNull: true,
      references: '"lists"',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(100)',
      notNull: true,
    },
    position: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.sql(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON lists
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
