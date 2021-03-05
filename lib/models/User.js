const pool = require('../utils/pool');

class User {
  id;
  unique_id;
  name;
  nickname;

  constructor(rows) {
    this.id = rows.id;
    this.uniqueId = rows.unique_id;
    this.name = rows.name;
    this.nickname = rows.nickname;
  }

  static async addNewUser({ uniqueId, name, nickname }) {
    const {
      rows,
    } = await pool.query(
      `INSERT INTO users (unique_id, name, nickname) VALUES ($1, $2, $3) RETURNING *`,
      [uniqueId, name, nickname]
    );

    return new User(rows[0]);
  }

  static async findByUniqueId({ uniqueId }) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE unique_id = ${uniqueId}`
    );
    if (!rows[0]) {
      throw new Error('no user found with unique id');
    }
    return new User(rows[0]);
  }
}
module.exports = User;
