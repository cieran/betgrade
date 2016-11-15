var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var marketSchema = require('../models/market.js');
var Market = new marketSchema;
var Student = require('../models/student.js');

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
    app.get('/markets/:filename', function(req, res, next){
        var filename = req.params.filename;
        Market.find({"filename" : filename})
            .then(function(doc){
                res.render(filename, {title: 'Markets', markets: doc, user: req.user});
        });
    });    
    app.get('/catagories/csse', function(req, res, next){
        Market.find({"course" : 'csse', "marketname" : 'Pass or Fail'})
            .then(function(doc){
                res.render('csse', {title: 'CSSE | Markets', markets: doc, user: req.user});
        });
    });    
    app.get('/catagories/cs', function(req, res, next){
        Market.find({"course" : 'cs', "marketname" : 'Pass or Fail'})
            .then(function(doc){
                res.render('cs', {title: 'CS | Markets', markets: doc, user: req.user});
        });
    });    
    app.get('/catagories/ct', function(req, res, next){
        Market.find({"course" : 'ct', "marketname" : 'Pass or Fail'})
            .then(function(doc){
                res.render('ct', {title: 'CT | Markets', markets: doc, user: req.user});
        });
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