var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var StudentNumber = require('../models/snumber');

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
        var saved = false;
        process.nextTick(function(){
        StudentNumber.findOne({'number' : snumber, 'used' : true}, function(error, user){
            console.log("we're searching for a student numebr");
            if(error)
                return done(error);
            if(user){
                return done(null, false, req.flash('snumberMessage', 'Student Number already registered'));
            }
        });
        User.findOne({'username' : username}, function(err, user){
                if(err)
                    return done(err);
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
                            saved = true;
                            console.log("Updating " + snumber);
                            return done(null, newUser);
                        }
                    });
                }
        }); 
        if(saved == true){
            console.log("we in here");
            StudentNumber.update({'number' : snumber}, {$set : {'used': true}});
        }     
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