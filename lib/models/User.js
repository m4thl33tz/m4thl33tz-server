const pool = require('../utils/pool');

class User {
  id;
  email;
  name;
  nickname;

  constructor(rows) {
    this.id = rows.id;
    this.email = rows.email;
    this.name = rows.name;
    this.nickname = rows.nickname;
  }

  static async addNewUser({ email, name, nickname }) {
    const {
      rows,
    } = await pool.query(
      'INSERT INTO users (email, name, nickname) VALUES ($1, $2, $3) RETURNING *',
      [email, name, nickname]
    );

    return new User(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = ($1)',
      [email]
    );
    if (!rows[0]) {
      return false;
    }
    return new User(rows[0]);
  }
}
module.exports = User;
