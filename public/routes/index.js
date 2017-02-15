var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var updates = require('./update');
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');
var Test = require('../models/test');
var Participant = require('../models/participant');
var async = require('async');
/**
var ExpressBrute = require('express-brute');
var MemcachedStore = require('express-brute-memcached');
var moment = require('moment');
var store = new MemcachedStore('138.68.138.40:11211');
var failCallback = function (req, res, next, nextValidRequestDate) {
    req.flash('error', "No bruteforcing please. You can come off the naughty step "+moment(nextValidRequestDate).fromNow()+ ".");
    res.redirect('/');
};
var stopThem = new ExpressBrute(store, {
    freeRetries:2, 
    refreshTimeoutOnRequest: false,
    minWait: 1000 * 60 * 5,
    maxWait: 1000 * 60 * 15,
    failCallback: failCallback,
});
**/
module.exports = function(app, passport){
    app.get('/', function(req, res, next){
        Market.find({"marketname" : 'To Pass'}).limit(10)
            .then(function(doc){
                res.render('index', {title: 'Betgrade | Home', message: req.flash('bet-update'), items: doc, user: req.user});
        });
    });

    app.get('/test-env', function(req, res, next){
        Market.find({"marketname" : 'To Pass', "student":"Ade Akingbade"})
            .then(function(doc){
                async.forEach(doc, function(x, callback){
                    updates.newfindValue(x);
                    callback();
                }, function(err){
                    if(err)
                        return console.log(err)
                    console.log("completed async");
                    res.render('test-env', {title: 'Test..', items: doc, user: req.user});
                });
        });
    });
    app.get('/profile/bet-history', function(req, res, next){
        var user = req.user;
        if(user){
            Bet.find({$query : {"username" : user.username, "paired" : true, "settled" : false}, $orderby : {_id : -1}})
                .then(function(doc){
                    doc.forEach(function(x) {
                       updates.calcReturns(x);
                       updates.cashout_value(x);
                    })
                    
                    res.render('profile/bet-history', {title: "Bet History | Betgrade", message:req.flash('cashout-update'), bets: doc, user: req.user}); 
            });
        }else{
            res.redirect('/login');
        }
    });
    app.post('/cashout', function(req, res){
        var bet_id = req.body.betid;
        var cashout = req.body.cashout;
        var user = req.user.username;
        var set_profit = req.body.profit;
        Bet.find({"_id" : bet_id}).then(function(bet){
            var bet = bet[0];
            if(bet.bet == "Back"){
                Market.find({"marketname" : bet.market, "student" : bet.student}).sort({btotal:-1}).limit(1)
                .then(function(doc){
                    var liability = Math.round((((doc[0].back * bet.stake) - bet.stake) * 100)/100);
                    var returns = bet.stake * bet.odds;
                    var profit = returns - bet.stake;
                    var diff = profit - liability;
                    var cashout_long = bet.stake + (diff / doc[0].back);
                    var calc_cashout = Math.round(cashout_long * 100) / 100;
                    if(calc_cashout == cashout){
                        Bet.findOneAndUpdate({"_id" : bet_id}, {$set : {"settled" : true}}, {new : true}, function(err){
                            if(err){
                                req.flash('cashout-update', "Uh oh, something went wrong.");
                                res.redirect('back');
                            }else{
                                User.findOneAndUpdate({"username":user}, {$inc : {"funds" : cashout, "profit" : set_profit}}, function(err){
                                    if(err){
                                        req.flash('cashout-update', "Nope... Something Went Wrong.");
                                        res.redirect('back');
                                    }else{
                                        req.flash('cashout-update', "You just cashed out for "+cashout+"mBTC.");
                                        res.redirect('back');
                                    }
                                });
                            }
                        });
                    }else{
                        req.flash('cashout-update', "Cashout value has changed! Please check again!");
                        res.redirect('back');
                    }

                });
            }else{
                Market.find({"marketname" : bet.market, "student" : bet.student}).sort({ltotal:-1}).limit(1)
                .then(function(doc){
                    var liability = Math.round((((doc[0].back * bet.stake) - bet.stake) * 100)/100);
                    var returns = bet.stake + bet.stake;
                    var profit = returns - bet.stake;
                    var diff = profit - liability;
                    var cashout_long = bet.stake + (diff / doc[0].back);
                    var calc_cashout = Math.round(cashout_long * 10 ) / 10;
                    if(calc_cashout == cashout){
                        Bet.findOneAndUpdate({"_id" : bet_id}, {$set : {"settled" : true}}, {new : true}, function(err){
                            if(err){
                                req.flash('cashout-update', "Uh oh, something went wrong.");
                                res.redirect('back');
                            }else{
                                User.findOneAndUpdate({"username":user}, {$inc : {"funds" : cashout, "profit" : set_profit}}, function(err){
                                    if(err){
                                        req.flash('cashout-update', "Nope... Something Went Wrong.");
                                        res.redirect('back');
                                    }else{
                                        req.flash('cashout-update', "You just cashed out for "+cashout+"mBTC.");
                                        res.redirect('back');
                                    }
                                });
                            }
                        });
                    }else{
                        req.flash('cashout-update', "Cashout value has changed! Please check again!");
                        res.redirect('back');
                    }
                });
            }
        });
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
        if(!req.user){
            req.flash('loginMessage', 'You need to log in before you can place a bet');
            res.render('auth/login', {'title' : 'Login | Betgrade', user: req.user, message: req.flash('loginMessage')});
        }else if(stake <= 0){
            req.flash('bet-update', 'Nice try! Stake must be at least 1mBTC.');
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });        
        }else{
            console.log("we have staked enough money");
            var errors = false;
            User.find({"username" : user.username}).then(function(funds, err){
                if(err){
                    req.flash('bet-update', err);
                    errors = true;
                }else{
                if(funds[0].funds < stake){
                    req.flash('bet-update', 'Insufficient Funds.');                    
                    errors = true;
                }else{
                    console.log("we have enough funds");
                    console.log("stake: " + stake);
                    User.findOneAndUpdate({"username" : user.username}, 
                                          {$inc : {"funds" : -stake}}, 
                                          {new : true}, function(err, result){
                        if(err){
                           req.flash('bet-update', err);
                           errors = true;
                        }else{
                            console.log("stake deducted");
                            console.log("new balance: " + result.funds);
                            var potential = 0;
                    if(side == "Back"){
                        potential = ((parseFloat(odds) * parseFloat(stake)));
                    }else{
                        potential = (stake*2);
                    }
                    if(errors === false){
                        console.log("no errors so far");
                        Participant.find({"student" : student}).exec(function(err, data){
                            async.forEach(data, function(doc, callback){

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
                                settled: false
                            });
                            newBet.save(function(err){
                                if(err){
                                    req.flash('bet-update', err);
                                }else{
                                req.flash('bet-update', 'Bet Placed.');
                                console.log("the bet has been placed");
                                updates.match(side, marketname, student, odds);
                                    if(side == "Back"){
                                        Market.update({"marketname" : marketname, "student": student, "back":odds, "lay":odds, "code":code, "filename":filename, "course":course}, {$inc : {'ltotal': stake, 'btotal' : 0}}, {upsert : true}, function(err, doc){
                                            if(err)
                                                req.flash('bet-update', err);
                                            console.log("ltotal updated");
                                        });
                                    }else{
                                        Market.update({"marketname" : marketname, "student": student, "back":odds, "lay":odds, "code":code, "filename":filename, "course":course}, {$inc : {'btotal': stake, 'ltotal' : 0}}, {upsert : true}, function(err, doc){
                                            if(err)
                                                req.flash('bet-update', err);
                                            
                                            console.log("btotal updated");
                                        });
                                    }
                                }
                            });

                            }, function(err){
                                if(err){
                                    throw err;
                                }
                                callback();
                            })});
                    }
                                }
                            });
                    }
                    }
                            
            });
            
            Market.find({"marketname" : 'To Pass'}).limit(10)
                .then(function(doc){
                    res.render('index', {title: 'Betgrade | Home', items: doc, user: req.user, message: req.flash('bet-update')});
            });

        }
    });
    app.get('/:404', function(req, res, next){
            var err = "The page you are looking for may not exist.";
            res.status(404);      
            res.render('error', {title: 'Betgrade | Error', message: err, user: req.user});
    });

};