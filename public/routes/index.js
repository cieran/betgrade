var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

module.exports = function(app, passport){
    app.get('/', function(req, res, next){
        Market.find({"marketname" : 'To Pass'}).limit(10)
            .then(function(doc){
                res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user});
        });
    });
    app.get('/profile/bet-history', function(req, res, next){
        var user = req.user;
        if(user){
            Bet.find({$query : {"username" : user.username}, $orderby : {_id : -1}})
                .then(function(doc){
                    res.render('profile/bet-history', {title: "Bet History | Betgrade", bets: doc, user: req.user}); 
            });
        }else{
            res.redirect('/login');
        }
    });
    app.get('/profile/leaderboard', function(req, res, next){
        var user = req.user;
        if(user){
            User.find({$query : {"username" : {$exists : true}}, $orderby : {profit : -1}})
                    .then(function(doc){
                    res.render('profile/leaderboard', {title: "Leaderboard | Betgrade", users: doc, user: req.user}); 
            });
        }else{
            res.redirect('/login');
        }
    });
    app.get('/profile', function(req, res, next){
        var user = req.user;
        if(user){
            User.find({$query : {"username" : {$exists : true}}, $orderby : {profit : -1}})
                    .then(function(doc){
                    res.render('profile/profile', {title: "Your Profile | Betgrade", users: doc, user: req.user}); 
            });
        }else{
            res.redirect('/login');
        }
    });
    app.get('/markets/:filename', function(req, res, next){
        var filename = req.params.filename;
        var ext = "people/" + filename;
        Market.find({"filename" : filename})
            .then(function(doc){
                res.render(ext, {title: 'Markets', markets: doc, user: req.user});
        });
    });    
    app.get('/catagories/csse', function(req, res, next){
        Market.find({"course" : 'csse', "marketname" : 'To Pass'})
            .then(function(doc){
                res.render('catagories/csse', {title: 'CSSE | Markets', markets: doc, user: req.user});
        });
    });    
    app.get('/catagories/cs', function(req, res, next){
        Market.find({"course" : 'cs', "marketname" : 'To Pass'})
            .then(function(doc){
                res.render('catagories/cs', {title: 'CS | Markets', markets: doc, user: req.user});
        });
    });    
    app.get('/catagories/ct', function(req, res, next){
        Market.find({"marketname" : 'To Pass', "course" : 'ct'})
            .then(function(doc){
                console.log(doc);
                res.render('catagories/ct', {title: 'CT | Markets', markets: doc, user: req.user});
        });
    });
    app.get('/signup', function(req, res){
        res.render('auth/signup', {title: 'Register | Betgrade', message: req.flash('signupMessage') });
    });
    app.post('/signup', passport.authenticate('local-signup',{
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash: true
    }));

    app.get('/login', function (req, res) {
      res.render('auth/login', {title: 'Login | Betgrade', message: req.flash('loginMessage') });
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
        res.render('auth/optout', {title: 'Student Opt-Out | Betgrade', user: req.user});
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
                    res.render('auth/optout', {'title' : 'Student Opt-Out | Betgrade', user: req.user, message: req.flash('error_removal')});
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
        }else if(stake <= 0){
            req.flash('bet-update', 'Nice try! Stake must be at least 1mBTC.');
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });        
        
        }else{
            var errors = true;
            User.findOne({"username" : user.username, "funds" : {$gte : stake}}, function(err, funds){
                if(err)
                    req.flash('bet-update', 'An Error Occurred.');
                    errors = true;
                if(!funds){
                    req.flash('bet-update', 'Insufficient Funds.');                    
                    errors = true;
                }else{
                    User.findOneAndUpdate({"username" : user.username}, 
                                          {$inc : {"funds" : -stake}}, 
                                          {new : true}, function(err){
                        if(err){
                           req.flash('bet-update', 'An Error Occurred.');
                           errors = true;
                        }else{
                            errors = false;
                        }
                    });
                }
                    
            });
            var potential = 0;
            if(side == "Back"){
                potential = (parseInt(stake) + (parseInt(odds) * parseInt(stake)));
            }else{
                potential = (stake*2);
            }
            if(errors == false){
                var newBet = new Bet({
                    bet: side, 
                    market: marketname, 
                    student: student, 
                    paired: false, 
                    odds: odds, 
                    stake : stake, 
                    potential: potential, 
                    username: user.username, 
                    settled: false
                });
                newBet.save(function(err){
                    req.flash('bet-update', 'Bet Placed.');
                    if(err){
                        req.flash('bet-update', err);
                    }
                });
                if(side == "Back"){
                     Market.findOneAndUpdate({"marketname" : marketname, "student": student}, {$inc : {'btotal': stake}}, {new : true}, function(err, doc){
                        if(err)
                            req.flash('bet-update', err);
                    });
                }else{
                     Market.findOneAndUpdate({"marketname" : marketname, "student": student}, {$inc : {'ltotal': stake}}, {new : true}, function(err, doc){
                        if(err)
                            req.flash('bet-update', err);
                    });
                }

            }
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });
        }
    });

};