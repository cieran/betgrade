var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('betgrade.co:27017/betgrade');
var Schema = mongoose.Schema;
var User = require('../models/user');

/*
    Betting
*/
var BetSchema = new Schema({
    market: String,
    bet: String,
    amount: Number,
    odds: Number,
    user: String,
    settled: Boolean
}, {collection: 'bets'});

var Bet = mongoose.model('Bet', BetSchema);

var MarketSchema = new Schema({
    marketname: String,
    markettype: String,
    A: Number,
    B: Number,
    C: Number,
    D: Number,
    E: Number,
    filename: String,
    total: Number,
    settled: Boolean
}, {collection: 'markets'});

var Market = mongoose.model('Market', MarketSchema);

router.get('/', function(req, res, next){
    Market.find()
        .then(function(doc){
            res.render('index', {items: doc});
    });
});

router.get('/get-market', function(req, res, next){
    Market.find()
        .then(function(doc){
            res.render(this.filename);
    });
});

router.get('/signup', function(req, res){
    res.render('signup');
});
router.post('/signup', function (req, res) {
  User.register(new User({ 
      username: req.body.username }), req.body.password,
    function (err, newUser) {
      passport.authenticate('local')(req, res, function() {
        res.send('signed up!!!');
      });
    }
  );
});


module.exports = router;
