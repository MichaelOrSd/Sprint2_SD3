const Pool = require('pg').Pool;

const pool = new Pool({
  // user and password have to be set to an appropriate user to someones pgAdmin
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  // selects what db to acess
  database: 'Stock_Market',
  // default port for pgAdmin
  port: 5432,
});

module.exports = pool;
