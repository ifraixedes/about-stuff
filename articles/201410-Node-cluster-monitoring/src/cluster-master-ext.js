'use strict';

var path = require('path');
var ClusterMaster = require('cluster-master-ext');

ClusterMaster({
  exec: path.resolve(__dirname, 'server-api.js'),
  size: 5,
  aliveEvent: 'listening',
  repl: 3001
});
