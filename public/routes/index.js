var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var app = express.Router();
var MarketSchema = new Schema({
    marketname: String,    
    student: String,
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
    app.get('/', function(req, res, next){
        Market.find({"marketname" : 'Pass or Fail'}).limit(10)
            .then(function(doc){
                res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user});
        });
    });
    app.get('/profile', function(req, res){
        res.render('profile', {user: req.user});
    });
    app.get('/signup', function(req, res){
        res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup',{
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash: true
    }));

    app.get('/login', function (req, res) {
      res.render('login', {message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));

    app.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/login');
    });

};