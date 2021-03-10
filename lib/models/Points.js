const pool = require('../utils/pool');

class Points {
  id;
  player_id;
  points;

  constructor(rows) {
    this.id = rows.id;
    this.playerId = rows.player_id;
    this.points = rows.points;
  }

  static async createPoints({ uniqueId }) {
    const {
      rows,
    } = await pool.query(
      'INSERT INTO points (player_id, points) VALUES ($1, $2) RETURNING *',
      [uniqueId, 0]
    );
    return new Points(rows[0]);
  }

  static async findAllPoints() {
    const { rows } = await pool.query(
      'SELECT users.name, points.points FROM points INNER JOIN users ON points.player_id = users.unique_id'
    );
    return rows;
  }

  static async findPointsByUniqueId(uniqueId) {
    const {
      rows,
    } = await pool.query(
      'SELECT users.name, points.points FROM points INNER JOIN users ON points.player_id = users.unique_id WHERE player_id = ($1)',
      [uniqueId]
    );
    console.log(rows[0]);
    if (!rows[0]) console.log('NO user with Player_id matching');
    return rows[0];
  }

  static async addPoints({ uniqueId, points }) {
    const {
      rows,
    } = await pool.query(
      'UPDATE points SET points = points + ($1) WHERE player_id = ($2) RETURNING *',
      [points, uniqueId]
    );
    if (!rows[0]) {
      console.log('no user with unique id matching', rows[0]);
    }
    return new Points(rows[0]);
  }
}
module.exports = Points;
