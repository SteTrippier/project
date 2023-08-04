const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '../projectVariables.env' });

// Create a connection to the database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Stein21244!',
  port: 5432
});

class User {
  constructor(id, username, password, role) {
    this.id = id;
    this.username = username;
    this.password_hash = password;
    this.role = role;
  }

  static async findById(id) {
    try {
      // try to find the user by id
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      // if not found return null
      if (res.rows[0] == undefined) {
        console.log(res.rows[0] + " is undefined");
        return null;
      }
      // if found return an instance of User
      else {
        const { id, username, password_hash, role } = res.rows[0];
        return new User(id, username, password_hash, role);
      }
    } catch (err) {
      // if error return null
      console.error(err);
      return null;
    }
  }

  static async findOne(username) {
    try {
      // try to find the user by username
      const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

      // if not found return null
      if (res.rows[0] == undefined) {
        console.log(res.rows[0] + " is undefined");
        return null;
      }
      // if found return an instance of User
      else {
        const { id, username, password_hash, role } = res.rows[0];
        console.log("findOne method: " + username + " " + password_hash + " " + role);
        return new User(id, username, password_hash, role);
      }
    } catch (err) {
      // if error return null
      console.error(err);
      return null;
    }
  }

  async save() {
    try {
      const res = await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id', [this.username, this.password_hash, this.role]);
      this.id = res.rows[0].id;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  async setPassword(password) {
    let saltRounds = 10;
    this.password_hash = await bcrypt.hash(password, saltRounds);
  }
}

module.exports = User;
