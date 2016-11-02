'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');
var passport = require('passport');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var config = require('./public/config/database.js');
var User = require('./public/app/models/user.js');
var jwt = require('jwt-simple');
var hbs = require('express-handlebars');
var port = process.env.PORT || 3000;
var app = express();


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/public/views/layouts/'}));
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'hbs');
app.use(morgan('dev'));
app.use(cookieParser());
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
              res.redirect('../../index.html');
          }else{
              res.redirect('../../index.html');
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
