var Hapi = require('hapi'),
    Inert = require('inert'),
    Vision = require('vision'),
    Good = require('good'),
    Routes = require('./lib/routes'),
    CardStore = require('./lib/cardStore'),
    Boom = require('boom');

var cards = CardStore.initialize();
var server = new Hapi.Server();

var logOptions = {
  opsInterval: 3600000,
  reporters: [
    {
      reporter: require('good-file'),
      events: { ops: '*' },
      config: { path: './logs', prefix: 'hapi-process', rotate: 'daily' }
    },
    {
      reporter: require('good-file'),
      events: { response: '*' },
      config: { path: './logs', prefix: 'hapi-response', rotate: 'daily' }
    },
    {
      reporter: require('good-file'),
      events: { error: '*' },
      config: { path: './logs', prefix: 'hapi-error', rotate: 'daily' }
    }
  ]
};

server.connection({ port: process.env.PORT || 5000 });

server.ext('onPreResponse', function(request, reply) {
  if (request.response.isBoom) {
    return reply.view('error.html', request.response);
  }
  reply.continue();
});

server.register(Inert, function(err) {
  if (err) {
    throw err;
  }
  console.log('Inert registered');
});

server.register(Vision, function(err) {
  if (err) {
    throw err;
  }
  console.log('Vision registered');
});

server.register({
  register: Good,
  options: logOptions
}, function(err) {
  if (err) {
    throw err;
  }
  console.info('Good Registered');
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: './templates'
});

server.route(Routes);

server.start(function() {
  console.log('Listening on ' + server.info.uri);
});
