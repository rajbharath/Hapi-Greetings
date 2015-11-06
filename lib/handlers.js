var Uuid = require('uuid'),
    Fs = require('fs'),
    Joi = require('joi'),
    CardStore = require('./cardStore'),
    Boom = require('boom');

var Handlers = {};

var cardSchema = Joi.object().keys({
  name: Joi.string().min(3).max(50).required(),
  recipient_email: Joi.string().email().required(),
  sender_name: Joi.string().min(3).max(50).required(),
  sender_email: Joi.string().email().required(),
  card_image: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
});

Handlers.newCardHandler = function (request, reply) {
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
      reply.redirect('/cards');
    });
  }
}

Handlers.cardsHandler = function (request, reply) {
  reply.view('cards', { cards: CardStore.cards });
}

Handlers.deleteCardHandler = function (request, reply) {
  delete CardStore.cards[request.params.id];
  reply();
}

function saveCard(card) {
  var id = Uuid.v1();
  card.id = id;
  CardStore.cards[id] = card;
}

function mapImages() {
  return Fs.readdirSync('./public/images/cards');
}

module.exports = Handlers;
