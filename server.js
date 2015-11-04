var Hapi = require('hapi'),
    Inert = require('inert'),
    Uuid = require('uuid'),
    Vision = require('vision'),
    Fs = require('fs'),
    Good = require('good'),
    Joi = require('joi'),
    Boom = require('boom');

var server = new Hapi.Server();


var logOptions = {
  reporters: [{
    reporter: require('good-console'),
    events: { log: '*', response: '*'}
  }]
};

var cardSchema = Joi.object().keys({
  name: Joi.string().min(3).max(50).required(),
  recipient_email: Joi.string().email().required(),
  sender_name: Joi.string().min(3).max(50).required(),
  sender_email: Joi.string().email().required(),
  card_image: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
});

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
    reply.view('new.html', { cardImages: mapImages() });
  } else {
    Joi.validate(request.payload, cardSchema, function(err, val) {
      if (err) {
        return reply(Boom.badRequest(err.details[0].message));
      }
      var card = {
        name: val.name,
        email: val.recipient_email,
        sender_name: val.sender_name,
        sender_email: val.sender_email,
        card_image: val.card_image
      };
      saveCard(card);
      console.log(cards);
      reply.redirect('/cards');
    });
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

function mapImages() {
  return Fs.readdirSync('./public/images/cards');
}

server.start(function() {
  console.log('Listening on ' + server.info.uri);
});
