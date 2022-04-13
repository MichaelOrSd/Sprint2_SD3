const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');
const fsPromise = require('fs').promises;
const crc32 = require('crc/crc32');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(methodOverride('_method'));

const stockDal = require('../services/stockInfo.dal');

app.get('/', async (req, res) => {
  const searchByMarket = [];
  const searchByName = [];
  const searchBySymbol = [];
  res.render('postgres.ejs', {
    searchByMarket,
    searchByName,
    searchBySymbol,
  });
});

app.post('/', async (req, res) => {
  try {
    const input = req.body.search;
    const searchByMarket = (await stockDal.getStockByMarket(input)) || [];
    const searchByName = (await stockDal.getStockByName(input)) || [];
    const searchBySymbol = (await stockDal.getStockBySymbol(input)) || [];
    if (
      searchByMarket.length === 0 &&
      searchByName.length === 0 &&
      searchBySymbol.length === 0
    )
      res.render('postgres.ejs', {
        messages: { error: 'Cannot Find Anything D:' },
        searchByMarket,
        searchByName,
        searchBySymbol,
      });
    else {
      res.render('postgres.ejs', {
        searchByMarket,
        searchByName,
        searchBySymbol,
      });
    }
  } catch {
    res.render('postgres.ejs', {
      messages: { error: 'Cannot Find Anything D:' },
      searchByMarket,
      searchByName,
      searchBySymbol,
    });
  }
});

module.exports = app;
