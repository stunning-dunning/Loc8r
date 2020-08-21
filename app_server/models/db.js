const mongoose = require('mongoose');
const host = process.env.DB_HOST || "mongodb://127.0.0.1/"
const dbURL = `${host}`;
const readline = require('readline');
//const dbURI = 'mongodb: //localhost/Loc8r';
//mongoose.connect(dbURI, {useNewUrlParser: true});
const connect = () => {
  setTimeout(() => mongoose.connect(dbURL, { useNewUrlParser: true, useCreateIndex: true }), 3000);
}

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURL}`);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  })
};
// for nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// for app termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});
connect();

require('./locations');