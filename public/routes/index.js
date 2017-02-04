var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var updates = require('./update');
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');
var Participant = require('../models/participant');

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
        Market.find({$query : {"filename" : filename}, $orderby : {marketname : -1}})
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
        var user = req.user;
        if(user){
            res.redirect('/');
        }else{
        res.render('auth/signup', {title: 'Register | Betgrade', message: req.flash('signupMessage') });
        }
    });
    app.post('/signup', passport.authenticate('local-signup',{
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash: true
    }));

    app.get('/login', function (req, res) {
        var user = req.user;
        if(user){
            res.redirect('/');
        }else{
            res.render('auth/login', {title: 'Login | Betgrade', message: req.flash('loginMessage') });
        }
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
        Participant.count({"student" : {$exists : true, $eq : student_name}, "code" : {$exists : true, $eq : removal_code}}, function(err, count){
            if(count > 0){
                Market.remove({"student" : student_name}, function(){
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
    app.get('/bet', function (req, res) {
        res.redirect('/');
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
            res.render('auth/login', {'title' : 'Login | Betgrade', user: req.user, message: req.flash('bet_error')});
        }else if(stake <= 0){
            req.flash('bet-update', 'Nice try! Stake must be at least 1mBTC.');
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });        
        
        }else{
            var errors = false;
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
            if(errors === false){
                Participant.findOne({"student" : student}, function(err, data){
                    async.map(data, function(doc, callback){
                    if(err){
                        req.flash('bet-update', err);
                    }
                    var code = doc.code;
                    var filename = doc.filename;
                    var course = doc.course;

                    var newBet = new Bet({
                        bet: side, 
                        market: marketname, 
                        student: student, 
                        paired: false, 
                        to_match: stake,
                        odds: odds, 
                        stake : stake, 
                        potential: potential, 
                        username: user.username, 
                        settled: false,
                        code: code,
                        filename: filename,
                        course: course
                    });
                    newBet.save(function(err){
                        req.flash('bet-update', 'Bet Placed.');
                        updates.match();
                        if(err){
                            req.flash('bet-update', err);
                        }
                    });

                    if(side == "Back"){
                         Market.update({"marketname" : marketname, "student": student, "back":odds, "lay":odds}, {$inc : {'btotal': stake}}, {upsert : true}, function(err, doc){
                            if(err)
                                req.flash('bet-update', err);
                        });
                    }else{
                         Market.update({"marketname" : marketname, "student": student, "back":odds, "lay":odds}, {$inc : {'ltotal': stake}}, {upsert : true}, function(err, doc){
                            if(err)
                                req.flash('bet-update', err);
                        });
                    }
                    }, function(err){
                        if(err){
                            throw err;
                        }
                        callback();
                    })});
                }
                

            }
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });
        }
    });

};