Evaluation of some npm modules to monitor/control NodeJs clusters
==========

## Introduction

NodeJS web applications and RESTful API running in production has increased and still increasing hence the demand to run NodeJS in cluster to be able to support bigger traffic and amount of request is increasing as well.

NodeJS added a cluster API module since version 0.6, however it was very poor in terms of functionality and performance (you can see its API [here](http://nodejs.org/dist/v0.6.0/docs/api/cluster.html)), so we can consider that it seriously brought it since version 0.8 how it was announced in its [blog](http://blog.nodejs.org/2012/06/25/node-v0-8-0/); on the other hand version 0.10 didn't bring almost any [changes to it](http://blog.nodejs.org/2013/03/11/node-v0-10-0-stable/) and the next improvement will be in the release 0.12, as Ben Noordhuis wrote [here](http://strongloop.com/strongblog/whats-new-in-node-js-v0-12-cluster-round-robin-load-balancing/) almost a year ago.

Running NodeJS in cluster has bring other challenges for systems which are in production; monitoring a NodeJS cluster is not exactly the same than monitoring a simple process and build systems than able to run in different processes are constrained not to share any state and must use external systems to share the state and allow the processed communicate between themselves. In this post I am not going to write about how to build a NodeJS application which run in a cluster but I am going to analyse some of the several NodeJS Modules that we can find in [npm](https://www.npmjs.org/) that they can help us to monitor them and start/stop workers (children) to balance the load and/or get rid of those which are consuming more resources than they should.

## NPM modules to analyse

There are a bunch of [npm modules about cluster](https://www.npmjs.org/search?q=cluster), so I picked some of those that I considered the most interesting ones:
* [cluster-master-ext](https://github.com/jeffbski/cluster-master)
* [pm2](https://github.com/Unitech/PM2)
* [strong-cluster-control](https://github.com/strongloop/strong-cluster-control)
* [cluster-service](https://github.com/godaddy/node-cluster-service)
* [easy-cluster](https://github.com/jsdevel/node-easy-cluster)

To analyse them, I have created a basic [express](http://expressjs.com/) application with one route ( `/`) which returns a random JSON data with a random timeout between 0 and 100 milliseconds
```js
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
  setTimeout(function () {
    res.json(data[Math.floor(Math.random() * 10)]);
  }, Math.random() * 100);
});

server = app.listen(3000, function () {
  console.log('server cluster node %s, listening on port 3000', process.pid);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

My aim is running this modules on the current stable NodeJS release, which is 0.10.32 unless that the module require to use another one.

On the other hand, I used [vegeta](https://github.com/tsenart/vegeta), a load testing tool to execute a bunch of requests to be able to analyse each module, with the default options except `duration` which I set up to 1 minute.


## Module  [cluster-master-ext](https://github.com/jeffbski/cluster-master)

This modules is a fork of [cluster-master](https://github.com/isaacs/cluster-master), you can read in its repository what it provides on top of the original one.

Require to create a configuration file, it is not possible to run you server script from the command line, so the module does not expose a command line executable and has to be used as a module.

It allows to setup some options as number of workers, timeout to stop the workers and restart workers automatically when one of them dies.

The cluster may be monitored (inspected) through a `repl` which is configured how to expose it in the cluster configuration object; it allows to expose `repl` over TCP connection or a UNIX socket.

The `repl` exposes some objects and functions which allow to access a very basic cluster's information as number of workers, workers' ages, PIDs, however it does not offer information about the load of each worker or another live information; it also expose some function to manage the cluster, for example to resize it with a new number of workers (increasing or decreasing), stoping or killing one of them, restart the cluster (stoping and starting again all the workers), etc.

The functions exposed in the `repl` plus some [events are exposed](https://github.com/jeffbski/cluster-master#events) on the `clusterMaster` object, hence it allows to response or do additional cleanup before the actions are carried out

For more information about the configuration parameters and functionality, check its [README file](https://github.com/jeffbski/cluster-master/blob/master/README.md)

## Credits
http://www.json-generator.com/ has been used to generate the JSON data file (`src/data.json`) used in the `server-api` implementation.