// models/user.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '../projectVariables.env' })

// Create a connection to the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Stein21244!',
    port: 5432
  });


class User {
  constructor(id, username, password_hash, role) {
    this.id = id;
    this.username = username;
    this.password_hash = password_hash;
    this.role = role;
  }

  static async findOne(username) {
    console.log(username.username);
    try {
      const res = await pool.query('SELECT * FROM users WHERE username = $1', [username.username]);
      console.log(res.rows[0]);
      if(res.rows[0] == undefined) {
        console.log(res.rows[0] + " is undefined")
        return null;
      } else {
        console.log(res.rows[0] + " is defined");
        const { id, username, password_hash, role } = res.rows[0];
        console.log(id, username, password_hash, role);
        return new User(id, username, password_hash, role);
      }
    } catch (err) {
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
      let result = await bcrypt.compare(password, this.password_hash);
      console.log(result);
      return result;
    }
}

module.exports = User;
