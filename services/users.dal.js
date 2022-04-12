// Getting the db code to gain access to pgAdmin!
const dal = require('./usersDb');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

var getUsers = function () {
  return new Promise(function (resolve, reject) {
    const sql = 'SELECT * FROM public.users';
    dal.query(sql, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

var getUsersByEmailnPass = function (email, password) {
  return new Promise(function (resolve, reject) {
    const sql = 'SELECT * FROM public.users WHERE email = $1 AND password = $2';
    dal.query(sql, [email, password], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
        console.log(result.password);
      }
    });
  });
};

var addUser = function (id, email, username, password) {
  return new Promise(function (resolve, reject) {
    const sql =
      'INSERT INTO public.users(id, email, username, password) VALUES ($1, $2, $3, $4);';
    dal.query(sql, [id, email, username, password], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

module.exports = {
  addUser,
  getUsers,
  getUsersByEmailnPass,
};
