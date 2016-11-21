var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

module.exports = function(passport){
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });
    
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done){
        var snumber = req.body.snumber;
        process.nextTick(function(){
        User.findOne({'number' : snumber, 'used' : true}, function(error, user){
            if(error){
                return done(null, false, req.flash('snumberMessage', 'Error Thrown'));
            }if(user){
                return done(null, false, req.flash('snumberMessage', 'Student Number already registered'));
            }else{
               User.findOne({'username':username}, function(err, user){
                if(err)
                    return done(null, false, req.flash('snumberMessage', 'Error Thrown'));
                if(user){
                    return done(null, false, req.flash('signupMessage', 'Username already registered.'));
                } else {
                    var newUser = new User();
                    newUser.username = username;
                    newUser.password = newUser.generateHash(password);
                    newUser.funds = 1000;
                    newUser.save(function(err){
                        if(err){
                            throw err;
                        }else{
                            User.findOneAndUpdate({'number' : snumber, 'used': false}, {$set : {'used': true}}, {new : true}, function(err, doc){
                                if(err)
                                    console.log("something went wrong: " + err);
                                console.log(doc);
                            });
                            console.log("Updating " + snumber);
                            return done(null, newUser);
                        }
                    });
                }
                }); 
            }
        });
            
        });
    }));
    
    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) {
        User.findOne({ 'username' :  username }, function(err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            return done(null, user);
        });

    }));

};