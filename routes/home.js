// Constants + modules
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

// Logging events
const logEvents = require('../scripts/logEvents');
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('log', (event, user, level, msg) =>
  logEvents(event, user, level, msg)
);

// Databases!
const usersDal = require('../services/users.dal');
const stockDal = require('../services/stockInfo.dal');
const { getByFirstName } = require('../services/search.dal');
const { getByStockMarket } = require('../services/search.dal');
const { getByStockSymbol } = require('../services/search.dal');

const initializePassport = require('../scripts/passport-config');
const { hash } = require('bcrypt');

// const { json } = require('stream/consumers');
initializePassport(
  passport,
  (email) => users1.find((user) => user.email === email),
  (id) => users1.find((user) => user.id === id)
);

let users1 = [];

// Had to use app.use instead of router.use as running router would cause errors w/ passport and our authenticated functions
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// When the path is /user we will render the basicUser.ejs

app.get('/', checkAuthenticated, (req, res) => {
  let name = users1 || [] || req.user.name;
  let user = users1;
  res.render('index.ejs', { user, name });
});

app.get('/test', async (req, res) => {
  // console.log(req.method);
  let users = await usersDal.getUsers();
  if (users.length === 0) res.render('norecord');
  else {
    res.render('test.ejs', { users });
  }
});

app.get('/login', checkNotAuthenticated, (req, res, e) => {
  res.render('login.ejs', { messages: {} });
});

app.post('/login', async (req, res) => {
  try {
    const hashedPassword2 = req.body.password;
    let user = await usersDal.getUsersByEmailnPass(
      req.body.email,
      hashedPassword2
    );
    users1.push(user);
    if (user.length === 0) {
      myEmitter.emit(
        'log',
        'ERROR',
        req.body.email,
        'LOGIN',
        'Incorrect Email or Password Used'
      );
      res.render('login.ejs', {
        messages: { error: 'Incorrect Email Or Password D:' },
      });
    } else {
      myEmitter.emit(
        'log',
        'INFO',
        req.body.email,
        'LOGIN',
        'A user logged in'
      );
      res.render('index.ejs', { user });
    }
  } catch {
    myEmitter.emit(
      'log',
      'ERROR',
      req.body.email,
      'LOGIN',
      'Incorrect Email or Password Used'
    );
    res.render('login.ejs', {
      messages: { error: 'Incorrect Email Or Password D:' },
    });
  }
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs', {
    messages: { error: '' },
  });
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await req.body.password;
    let crc = crc32(req.body.name).toString(16);
    let name = req.body.name;
    let email = req.body.email;
    let emailCheck = await usersDal.getUsersByEmail(email);
    if (emailCheck.length === 0) {
      myEmitter.emit('log', 'INFO', email, 'REGISTER', 'A New User Registered');
      await usersDal.addUser(crc, email, name, hashedPassword);
      res.redirect('/login');
    } else {
      myEmitter.emit('log', 'ERROR', email, 'REGISTER', 'Email already in use');
      res.render('register.ejs', {
        messages: { error: 'Email is in use D:' },
      });
    }
  } catch {
    myEmitter.emit('log', 'ERROR', email, 'REGISTER', 'Email already in use');
    res.render('register.ejs', {
      messages: { error: 'Email is in use D:' },
    });
  }
});

app.delete('/logout', (req, res) => {
  // req.logOut();
  myEmitter.emit(
    'log',
    'INFO',
    users1[0].email || users1[0][0].email,
    'LOGOUT',
    'A user logged out'
  );
  res.redirect('/login');

  users1 = [];
});

app.get('/postgres', checkAuthenticated, async (req, res) => {
  const searchByMarket = [];
  const searchByName = [];
  const searchBySymbol = [];
  res.render('postgres.ejs', {
    searchByMarket,
    searchByName,
    searchBySymbol,
  });
});

app.post('/postgres', checkAuthenticated, async (req, res) => {
  try {
    const input = await req.body.search;
    const searchByMarket = (await stockDal.getStockByMarket(input)) || [];
    const searchByName = (await stockDal.getStockByName(input)) || [];
    const searchBySymbol = (await stockDal.getStockBySymbol(input)) || [];
    if (
      searchByMarket.length === 0 &&
      searchByName.length === 0 &&
      searchBySymbol.length === 0
    ) {
      myEmitter.emit(
        'log',
        'ERROR',
        users1[0].email || users1[0][0].email,
        'POSTGRES SEARCH',
        'Error searching for ' + input
      );
      res.render('postgres.ejs', {
        messages: { error: 'Cannot Find Anything! Try: NASDAQ or NEWS ' },
        searchByMarket,
        searchByName,
        searchBySymbol,
      });
    } else {
      myEmitter.emit(
        'log',
        'INFO',
        users1[0].email || users1[0][0].email,
        'POSTGRES SEARCH',
        'User searched for ' + input
      );
      res.render('postgres.ejs', {
        searchByMarket,
        searchByName,
        searchBySymbol,
      });
    }
  } catch {
    myEmitter.emit(
      'log',
      'ERROR',
      users1[0].email || users1[0][0].email,
      'POSTGRES SEARCH',
      'Error searching for ' + input
    );
    res.render('postgres.ejs', {
      messages: { error: 'Cannot Find Anything! Try: NASDAQ or NEWS' },
      searchByMarket,
      searchByName,
      searchBySymbol,
    });
  }
});

app.get('/mongo', checkAuthenticated, async (req, res) => {
  const market = [];
  const stockName = [];
  const symbol = [];
  res.render('mongoSearch.ejs', {
    market,
    stockName,
    symbol,
  });
});

app.post('/mongo', checkAuthenticated, async (req, res) => {
  try {
    const input = await req.body.search;
    let stockName = (await getByFirstName(input)) || [];
    let market = (await getByStockMarket(input)) || [];
    let symbol = (await getByStockSymbol(input)) || [];
    if (stockName.length === 0 && market.length === 0 && symbol.length === 0) {
      myEmitter.emit(
        'log',
        'ERROR',
        users1[0].email || users1[0][0].email,
        'MONGO SEARCH',
        'Error searching for ' + input
      );
      res.render('mongoSearch.ejs', {
        messages: { error: 'Cannot Find Anything! Try: NASDAQ or WFM ' },
        market,
        stockName,
        symbol,
      });
    } else {
      myEmitter.emit(
        'log',
        'INFO',
        users1[0].email || users1[0][0].email,
        'MONGO SEARCH',
        'User searched for ' + input
      );
      res.render('mongoSearch.ejs', {
        market,
        stockName,
        symbol,
      });
    }
  } catch {
    myEmitter.emit(
      'log',
      'ERROR',
      users1[0].email || users1[0][0].email,
      'MONGO SEARCH',
      'Error searching for ' + input
    );
    res.render('mongoSearch.ejs', {
      messages: { error: 'Cannot Find Anything! Try: NASDAQ or WFM' },
      market,
      stockName,
      symbol,
    });
  }
});

app.get('/both', checkAuthenticated, async (req, res) => {
  const market = [];
  const stockName = [];
  const symbol = [];
  const searchByMarket = [];
  const searchByName = [];
  const searchBySymbol = [];
  res.render('both.ejs', {
    searchByMarket,
    searchByName,
    searchBySymbol,
    market,
    stockName,
    symbol,
  });
});

app.post('/both', checkAuthenticated, async (req, res) => {
  try {
    const input = await req.body.search;
    let stockName = (await getByFirstName(input)) || [];
    let market = (await getByStockMarket(input)) || [];
    let symbol = (await getByStockSymbol(input)) || [];
    const searchByMarket = (await stockDal.getStockByMarket(input)) || [];
    const searchByName = (await stockDal.getStockByName(input)) || [];
    const searchBySymbol = (await stockDal.getStockBySymbol(input)) || [];
    if (
      stockName.length === 0 &&
      market.length === 0 &&
      symbol.length === 0 &&
      searchByMarket.length === 0 &&
      searchByName.length === 0 &&
      searchBySymbol.length === 0
    ) {
      myEmitter.emit(
        'log',
        'ERROR',
        users1[0].email || users1[0][0].email,
        'MONGO & POSTGRES SEARCH',
        'Error searching for ' + input
      );
      res.render('both.ejs', {
        messages: { error: 'Cannot Find Anything! Try: NYSE or NEWS ' },
        market,
        stockName,
        symbol,
        searchByMarket,
        searchByName,
        searchBySymbol,
      });
    } else {
      myEmitter.emit(
        'log',
        'INFO',
        users1[0].email || users1[0][0].email,
        'MONGO & POSTGRES SEARCH',
        'User searched for ' + input
      );
      res.render('both.ejs', {
        searchByMarket,
        searchByName,
        searchBySymbol,
        market,
        stockName,
        symbol,
      });
    }
  } catch {
    myEmitter.emit(
      'log',
      'ERROR',
      users1[0].email || users1[0][0].email,
      'MONGO & POSTGRES SEARCH',
      'Error searching for ' + input
    );
    res.render('both.ejs', {
      messages: { error: 'Cannot Find Anything! Try: NYSE or NEWS' },
      searchByMarket,
      searchByName,
      searchBySymbol,
      market,
      stockName,
      symbol,
    });
  }
});

function checkAuthenticated(req, res, next) {
  if (users1.length === 1) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (users1.length === 1) {
    return res.redirect('/');
  }
  next();
}

module.exports = app;
