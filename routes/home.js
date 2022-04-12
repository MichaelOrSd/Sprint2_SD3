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

const usersDal = require('../services/users.dal');

const initializePassport = require('../scripts/passport-config');
const { hash } = require('bcrypt');
// const { json } = require('stream/consumers');
initializePassport(
  passport,
  (email) => users1.find((user) => user.email === email),
  (id) => users1.find((user) => user.id === id)
);

// Can connect to database here, perhaps a tokens.json?!
const users1 = [];


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
  res.render('index.ejs', { name: req.user.name });
});

app.get('/test', async (req, res) => {
  console.log(req.method);
  let users = await usersDal.getUsers();
  if (users.length === 0) res.render('norecord');
  else {
    res.render('test.ejs', { users, username });
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
    users1.push(JSON.stringify(user));
    console.log(users1)
    if (user.length === 0) res.render('/login');
    else {
      res.render('index.ejs', { user });
    }
  } catch {
    res.render('login.ejs', {
      messages: { error: 'Incorrect Password Or Email!' },
    });
  }
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await req.body.password;
    let crc = crc32(req.body.name).toString(16);
    let name = req.body.name;
    let email = req.body.email;
    users1.push({
      id: crc,
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    await usersDal.addUser(crc, email, name, hashedPassword);
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

module.exports = app;
