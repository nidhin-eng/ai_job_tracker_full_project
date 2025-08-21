const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "jobtracker",
  password: "nidhi",  
  port: 5432,
});

module.exports = pool;
