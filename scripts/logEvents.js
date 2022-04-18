global.DEBUG = true;
const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const rootPath = '../';

const logEvents = async (event, user, level, message) => {
  //  Creates date format and time formats
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
  // Creates format for the actual log
  const logItem = `${dateTime}\t${event}\t${level}\t${user}\t${message}\t${uuid()}`;
  if (DEBUG) console.log(logItem);
  try {
    // Creating format for the file
    const fileName = `${format(new Date(), 'yyyyMMdd')}` + '_events.log';
    await fsPromises.appendFile(path.join('logs', fileName), logItem + '\n');
  } catch (err) {
    console.log(err);
  }
};

module.exports = logEvents;
