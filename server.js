var Hapi = require('hapi');
var Inert = require('inert');
var Uuid = require('uuid');
var Vision = require('vision');
var Fs = require('fs');
var Good = require('good');

var server = new Hapi.Server();


var logOptions = {
  reporters: [{
    reporter: require('good-console'),
    events: { log: '*', response: '*'}
  }]
};

var cards = loadCards();

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
  method: ['GET', 'POST'],
  handler: newCardHandler
});

server.route({
  path: '/cards',
  method: 'GET',
  handler: cardsHandler
});

server.route({
  path: '/cards/{id}',
  method: 'DELETE',
  handler: deleteCardHandler
});

function newCardHandler(request, reply) {
  if (request.method === 'get') {
    reply.file('templates/new.html');
  } else {
    var card = {
      name: request.payload.name,
      email: request.payload.recipient_email,
      sender_name: request.payload.sender_name,
      sender_email: request.payload.sender_email,
      card_image: request.payload.card_image
    };
    saveCard(card);
    console.log(cards);
    reply.redirect('/cards');
  }
}

function cardsHandler(request, reply) {
  reply.view('cards', { cards: cards });
}

function deleteCardHandler(request, reply) {
  delete cards[request.params.id];
  reply();
}

function saveCard(card) {
  var id = Uuid.v1();
  card.id = id;
  cards[id] = card;
}

function loadCards() {
  var file = Fs.readFileSync('./cards.json');
  return JSON.parse(file.toString());
}

server.start(function() {
  console.log('Listening on ' + server.info.uri);
});
