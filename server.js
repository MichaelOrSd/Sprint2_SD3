if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const fs = require('fs');
const path = require('path');

// Sets port number for local host!
const port = process.env.PORT || 3000;

app.use(express.static('public'));
// extended true lets us do whatever we like, if false we cant
// post "nested objects"
app.use(express.urlencoded({ extended: true }));

app.set('view-engine', 'ejs');

app.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});

const indexRouter = require('./routes/home');

app.use('/', indexRouter);

app.use((req, res) => {
  res.status(404).render('404');
});
