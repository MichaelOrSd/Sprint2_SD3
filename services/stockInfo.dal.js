const dal = require('./stockInfoDb');

var getStockInfo = function () {
  return new Promise(function (resolve, reject) {
    const sql = 'SELECT * FROM public."Stock_Info"';
    dal.query(sql, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

var getStockByMarket = function (input) {
  return new Promise(function (resolve, reject) {
    const sql = 'SELECT * FROM public."Stock_Info" WHERE stock_market = $1';
    dal.query(sql, [input], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

var getStockByName = function (input) {
  return new Promise(function (resolve, reject) {
    const sql = 'SELECT * FROM public."Stock_Info" WHERE stock_name = $1';
    dal.query(sql, [input], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

var getStockBySymbol = function (input) {
  return new Promise(function (resolve, reject) {
    const sql = 'SELECT * FROM public."Stock_Info" WHERE stock_symbol = $1';
    dal.query(sql, [input], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

module.exports = {
  getStockInfo,
  getStockByMarket,
  getStockByName,
  getStockBySymbol,
};
