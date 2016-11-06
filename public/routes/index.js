var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('betgrade.co:27017/betgrade');
var Schema = mongoose.Schema;
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var app = express();
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


app.use(cookieParser());
app.use(session({
    secret: 'lionelrichie',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



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




module.exports = router;
