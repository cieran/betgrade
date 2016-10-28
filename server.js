'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./public/config/database.js');
var User = require('./public/app/models/user.js');
var jwt = require('jwt-simple');
var port = process.env.PORT || 3000;
var app = express();


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(passport.initialize());

mongoose.connect(config.database);

require('./public/config/passport')(passport);

var apiRoutes = express.Router();
apiRoutes.post('/signup', function(req, res){
   if(!req.body.username || !req.body.password){
       res.json({success: false, msg: 'GIMME A GOD DAMN USERNAME AND PASSWORD.'});
   } else{
       var newUser = new User({
           username: req.body.username,
           password: req.body.password,
           funds: 1000.0
       });
       newUser.save(function(err){
          if(err){
              res.redirect('../index.html');
          }else{
              res.json({success: true, msg: 'YOU OFFICIALLY BEEN PIMPED.'});
          }
       });
   }
});

apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      username: decoded.username
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.username + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
 
var getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

app.use('/public/api', apiRoutes);

app.listen(port);
console.log('Listening at port ' + port);
