var Fs = require('fs'),
    Joi = require('joi');

var CardStore = {};

CardStore.cards = {};

CardStore.initialize = function() {
  CardStore.cards = loadCards();
};

function loadCards() {
  var file = Fs.readFileSync('./cards.json');
  console.log(JSON.parse(file.toString()));
  return JSON.parse(file.toString());
}

module.exports = CardStore;
