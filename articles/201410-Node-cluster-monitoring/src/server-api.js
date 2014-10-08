'use strict';

var data = require('./data.json');
var express = require('express');
var app = express();
var server;

function shutdown() {
  console.log('Attempting to stop the server cluster node %s', process.pid);
  server.close(function () {
    console.log('server cluster node %s stopped', process.pid);
    process.exit(0);
  });
}

app.get('/', function (req, res) {
  res.json(data[Math.floor(Math.random() * 10)]);
});

server = app.listen(3000, function () {
  console.log('server cluster node %s', process.pid);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
