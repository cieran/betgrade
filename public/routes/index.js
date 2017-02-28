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
        Market.find({"marketname" : 'To Pass'}).sort({btotal : -1})
            .then(function(doc){
                doc.forEach(function(x){
                        updates.findValue(x);
                        updates.findValueBelow(x);
                        updates.findValueAbove(x);
                        updates.findValueAboveAbove(x);
                })
                setTimeout(function() {
                    // credit to user 'codebox' on StackOverflow for below hash code
                    // https://tinyurl.com/betgrade-stackoverflow-helper
                    function hash(o){
                        return o.student;
                    }
                    var hashesFound = {};
                    doc.forEach(function(o){
                        hashesFound[hash(o)] = o;
                    })
                    var results = Object.keys(hashesFound).map(function(k){
                        return hashesFound[k];
                    })
                    // end of supplied code
                    setTimeout(function() {
                        res.render('index', {title: "Home | Betgrade", message:req.flash('bet-update'), items: results, user: req.user});
                    }, 100);
                }, 500);

        });
    });
    app.get('/profile/bet-history', function(req, res, next){
        var user = req.user;
        if(user){
            Bet.find({$query : {"username" : user.username, "paired" : true, "settled" : false}, $orderby : {_id : -1}})
                .then(function(doc){
                    doc.forEach(function(x) {
                       updates.calcReturns(x);
                       updates.cashoutCalc(x);
                    })
                    
                    res.render('profile/bet-history', {title: "Bet History | Betgrade", message:req.flash('cashout-update'), bets: doc, user: req.user}); 
            });
        }else{
            res.redirect('/login');
        }
    });
    app.post('/cashout', function(req, res){
        var bet_id = req.body.betid;
        var check_cashout = req.body.cashout;
        var user = req.user.username;
        var set_profit = req.body.profit;
        console.log("we in here");
        Bet.find({"_id" : bet_id}).then(function(bet){
            var bet = bet[0];        
            console.log("we in bet.find");
            if(bet.bet == "Back"){
                console.log("we in the if back");
                Market.find({"marketname" : bet.market, "student" : bet.student}).sort({ltotal:-1}).limit(1)
                .then(function(doc){
                    console.log("we inside if's market.find");
                    var aL = (x.odds / doc[0].lay) * x.stake;
                    var aL_round = Math.round(aL * 100) / 100;
                    var returns = Math.round((aL_round - x.stake)*100)/100;                     
                    var cashout = Math.round((x.stake + returns) * 100)/100;
                    console.log("compare " + cashout + " with " + check_cashout);
                    if(cashout == check_cashout){
                        Bet.findOneAndUpdate({"_id" : bet_id}, {$set : {"settled" : true}}, {new : true}, function(err){
                            if(err){
                                req.flash('cashout-update', "Uh oh, something went wrong.");
                                res.redirect('back');
                            }else{
                                User.findOneAndUpdate({"username":user}, {$inc : {"funds" : check_cashout, "profit" : set_profit}}, function(err){
                                    if(err){
                                        req.flash('cashout-update', "Nope... Something Went Wrong.");
                                        res.redirect('back');
                                    }else{
                                        req.flash('cashout-update', "You just cashed out for "+check_cashout+"mBTC.");
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
                console.log("we in the else");
                Market.find({"marketname" : bet.market, "student" : bet.student}).sort({btotal:-1}).limit(1)
                .then(function(doc){
                    console.log("we inside else's market.find");
                    var aB = (x.odds / doc[0].back) * x.stake;
                    var aB_round = Math.round(aB * 100) / 100;
                    var returns = Math.round((x.stake - aB_round)*100)/100;
                    var cashout = Math.round((x.stake + returns) * 100)/100;
                    console.log("compare " + cashout + " with " + check_cashout);
                    if(cashout == check_cashout){
                        Bet.findOneAndUpdate({"_id" : bet_id}, {$set : {"settled" : true}}, {new : true}, function(err){
                            if(err){
                                req.flash('cashout-update', "Uh oh, something went wrong.");
                                res.redirect('back');
                            }else{
                                User.findOneAndUpdate({"username":user}, {$inc : {"funds" : check_cashout, "profit" : set_profit}}, function(err){
                                    if(err){
                                        req.flash('cashout-update', "Nope... Something Went Wrong.");
                                        res.redirect('back');
                                    }else{
                                        req.flash('cashout-update', "You just cashed out for "+check_cashout+"mBTC.");
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
                doc.forEach(function(x){
                        updates.findValue(x);
                        updates.findValueBelow(x);
                        updates.findValueAbove(x);
                        updates.findValueAboveAbove(x);
                })
                setTimeout(function() {
                    // credit to user 'codebox' on StackOverflow for below hash code
                    // https://tinyurl.com/betgrade-stackoverflow-helper
                    function hash(o){
                        return o.student;
                    }
                    var hashesFound = {};
                    doc.forEach(function(o){
                        hashesFound[hash(o)] = o;
                    })
                    var results = Object.keys(hashesFound).map(function(k){
                        return hashesFound[k];
                    })
                    // end of supplied code
                    setTimeout(function() {
                        res.render('catagories/csse', {title: 'CSSE | Markets', markets: results, user: req.user});
                    }, 100);
                }, 500);

        });
    });    
    app.get('/catagories/cs', function(req, res, next){
        Market.find({"course" : 'cs', "marketname" : 'To Pass'})
            .then(function(doc){
                doc.forEach(function(x){
                        updates.findValue(x);
                        updates.findValueBelow(x);
                        updates.findValueAbove(x);
                        updates.findValueAboveAbove(x);
                })
                setTimeout(function() {
                    // credit to user 'codebox' on StackOverflow for below hash code
                    // https://tinyurl.com/betgrade-stackoverflow-helper
                    function hash(o){
                        return o.student;
                    }
                    var hashesFound = {};
                    doc.forEach(function(o){
                        hashesFound[hash(o)] = o;
                    })
                    var results = Object.keys(hashesFound).map(function(k){
                        return hashesFound[k];
                    })
                    // end of supplied code
                    setTimeout(function() {
                        res.render('catagories/cs', {title: 'CS | Markets', markets: results, user: req.user});
                    }, 100);
                }, 500);

        });
    });    
    app.get('/catagories/ct', function(req, res, next){
        Market.find({"course" : 'ct', "marketname" : 'To Pass'})
            .then(function(doc){
                doc.forEach(function(x){
                        updates.findValue(x);
                        updates.findValueBelow(x);
                        updates.findValueAbove(x);
                        updates.findValueAboveAbove(x);
                })
                setTimeout(function() {
                    // credit to user 'codebox' on StackOverflow for below hash code
                    // https://tinyurl.com/betgrade-stackoverflow-helper
                    function hash(o){
                        return o.student;
                    }
                    var hashesFound = {};
                    doc.forEach(function(o){
                        hashesFound[hash(o)] = o;
                    })
                    var results = Object.keys(hashesFound).map(function(k){
                        return hashesFound[k];
                    })
                    // end of supplied code
                    setTimeout(function() {
                        res.render('catagories/ct', {title: 'CT | Markets', markets: results, user: req.user});
                    }, 100);
                }, 500);

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
        res.render('auth/optout', {title: 'Student Opt-Out | Betgrade', message:req.flash('error_removal'), user: req.user});
    });
    app.post('/optout', function(req, res){
        var student_name = req.body.student;
        var removal_code = req.body.code;
        console.log(student_name, removal_code);
        Participant.count({"student" : {$exists : true, $eq : student_name}, "code" : {$exists : true, $eq : removal_code}}, function(err, count){
            if(count > 0){
                Market.remove({"student" : student_name}, function(){
                        console.log("user removed");
                        req.flash('bet-update', 'Student has been removed from Betgrade!');
                        res.redirect('/');
                });
            } else {
                    console.log("error, wrong student or removal code");
                    req.flash('error_removal', 'Unknown Student or Removal Code!');
                    res.redirect('/optout');
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
            res.redirect('/login');
        }else if(stake <= 0 && odds > 1.0){
            req.flash('bet-update', 'Nice try! Stake must be at least 1mBTC and odds must be above 1.0.');
            res.redirect('/');        
        }else{
            // YOU HAVE AN ERROR HERE FAM FIX THAT SHIT
            console.log("we have staked enough money");
            var errors = false;
            User.find({"username" : user.username}).then(function(funds, err){
                if(err){
                    req.flash('bet-update', err);
                    res.redirect('/');
                    errors = true;
                }else{
                    if(funds[0].funds < stake){
                        req.flash('bet-update', 'Insufficient Funds.');                    
                        res.redirect('/');
                    }else{
                    console.log(funds[0].funds + " is my funds");
                    console.log(funds[0].funds + " is my funds");
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
            
            res.redirect('/');

        }
    });
    app.get('/:404', function(req, res, next){
            var err = "The page you are looking for may not exist.";
            res.status(404);      
            res.render('error', {title: 'Betgrade | Error', message: err, user: req.user});
    });

};