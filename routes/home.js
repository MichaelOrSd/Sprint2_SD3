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

const initializePassport = require('../services/passport-config');
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

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let crc = crc32(req.body.name).toString(16);
    let now = new Date();
    let name = req.body.name;
    let email = req.body.email;
    users1.push({
      id: crc,
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    fs.readFile('users.json', 'utf-8', function (err, data) {
      if (err) throw err;
      // This is setting the data to an array var
      var array = JSON.parse(data);
      // We're pushing the inputed data into the tokens array inside of the
      // data
      array.users.push({
        created: now,
        name: name,
        email: email,
        password: hashedPassword,
      });

      console.log(array);
      // This re-writes the json folder with the newly added token
      fs.writeFile(
        'users.json',
        JSON.stringify(array),
        'utf-8',
        function (err) {
          if (err) {
            console.log(err);
            throw err;
          }
        }
      );
    });
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
