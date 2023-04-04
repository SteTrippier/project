// seed.js
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'your_connection_string', // Replace with your connection string
  ssl: {
    rejectUnauthorized: false
  }
});

const insertUser = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
  } catch (err) {
    console.error(err);
  }
};

const seedDatabase = async () => {
  for (let i = 1; i <= 50; i++) {
    await insertUser(`user${i}`, `password${i}`);
  }
  console.log('50 sample users inserted into the database.');
  pool.end();
};

seedDatabase();
