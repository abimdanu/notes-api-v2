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
  // Adding a new user 'old_notes'
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old notes')");

  // Setting 'null' owner-s to 'old_notes'
  pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner IS NULL");

  // Adding a foreign key constraint to the 'owner' column
  pgm.addConstraint('notes', 'fk_notes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Dropping the foreign key constraint
  pgm.dropConstraint('notes', 'fk_notes.owner_users.id');

  // Setting 'old_notes' owner-s to 'null'
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

  // Deleting the 'old_notes' user
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
