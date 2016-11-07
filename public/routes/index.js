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

module.exports = function(app, passport){
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
      username: req.body.username,
      password: req.body.password,
      funds: 1000
  }), 
    function (err, newUser) {
      if(err){
          console.log(err);
      }
      passport.authenticate('local')(req, res, function() {
        res.send('signed up!!!');
      });
    }
  );
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate('local'), function (req, res) {
  res.send('logged in!!!');
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

};