var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var BetSchema = new Schema({
    market: String,
    bet: String,
    amount: Number,
    odds: Number,
    user: String,
    settled: Boolean
}, {collection: 'bets'});

var Bet = mongoose.model('Bet', BetSchema);

router.get('/', function(req, res, next){
   res.render('index');
});

router.get('/get-bets', function(req, res, next){
    Bet.find()
        .then(function(doc){
        res.render('index', {items: doc});
    });
});



module.exports = mongoose.model('Bet', BetSchema);
