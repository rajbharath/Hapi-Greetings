var Hapi = require('hapi');
var Inert = require('inert');
var server = new Hapi.Server();

server.connection({ port: 3000 });

server.ext('onRequest', function(request, reply) {
  console.log('Request received', request.path);
  reply.continue();
});

server.register(Inert, function(err) {
  if (err) {
    throw err;
  }
  console.log('Inert registered');
});

server.route({
  path: '/',
  method: 'GET',
  handler: {
    file: 'templates/index.html'
  }
});

server.route({
  path: '/assets/{path*}',
  method: 'GET',
  handler: {
    directory: {
      path: './public',
      listing: false
    }
  }
});

server.route({
  path: '/cards/new',
  method: 'GET',
  handler: function(request, reply) {
    reply.file('templates/new.html');
  }
});

server.route({
  path: '/cards/new',
  method: 'POST',
  handler: function(request, reply) {
    //business logic
    reply.redirect('/cards');
  }
});

server.route({
  path: '/cards',
  method: 'GET',
  handler: function(request, reply) {
    reply.file('templates/cards.html');
  }
});

server.start(function() {
  console.log('Listening on ' + server.info.uri);
});
