var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Market = require('../models/market');
var User = require('../models/user');

module.exports = function(app, passport){
    app.get('/', function(req, res, next){
        Market.find({"marketname" : 'To Pass'}).limit(10)
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
    app.get('/optout', function(req, res){
        res.render('optout', {title: 'Student Opt-Out | Betgrade', user: req.user});
    });
    app.post('/optout', function(req, res){
        var student_name = req.body.student;
        var removal_code = req.body.code;
        console.log(student_name, removal_code);
        Market.count({"student" : {$exists : true, $eq : student_name}, "code" : {$exists : true, $eq : removal_code}}, function(err, count){
            if(count > 0){
                Market.remove({"student" : student_name, "code" : removal_code}, function(){
                        console.log("user removed");
                        req.flash('removal', 'Student has been removed from Betgrade!');
                        Market.find({"marketname" : 'To Pass'}).limit(10)
                            .then(function(doc){
                                res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('removal')});
                        });
                });
            } else {
                    console.log("error, wrong student or removal code");
                    req.flash('error_removal', 'Unknown Student or Removal Code!');
                    res.render('optout', {'title' : 'Student Opt-Out | Betgrade', user: req.user, message: req.flash('error_removal')});
            }
        });
    });
    app.post('/bet', function(req, res){
        var stake = req.body.stake;
        var odds = req.body.odds;
        var user = req.user;
        var student = req.body.student;
        var marketname = req.body.marketname;
        var side = req.body.side;
        console.log(req.body, req.user);
        if(!req.user){
            req.flash('bet_error', 'You need to log in before you can place a bet');
            res.render('login', {'title' : 'Login | Betgrade', user: req.user, message: req.flash('bet_error')});
        }else{
            User.findOne({"username" : user.username, "funds" : {$gte : stake}}, function(err, funds){
                if(err)
                    req.flash('bet-update', 'An Error Occurred.');
                if(!funds){
                    req.flash('bet-update', 'Insufficient Funds.');
                }else{
                    User.findOneAndUpdate({"username" : user.username}, 
                                          {$inc : {"funds" : -stake}}, 
                                          {new : true}, function(err){
                        if(err)
                           req.flash('bet-update', 'An Error Occurred.');;
                        req.flash('bet-update', 'Your funds have been updated.');
                    });
                }
                    
            });
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });
        }
    });

};