'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/database.js');
var User = require('./app/models/user.js');
var jwt = require('jwt-simple');
var port = process.env.PORT || 3000;
var app = express();

//app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/', function(req, res){
    res.send('hello, API at http://betgrade.co:' + port + '/api');
});
mongoose.connect(config.database);

require('./config/passport')(passport);

var apiRoutes = express.Router();
apiRoutes.post('/signup', function(req, res){
   if(!req.body.name || !req.body.password){
       res.json({success: false, msg: 'Please pass the username and password.'});
   } else{
       var newUser = new User({
           name: req.body.name,
           password: req.body.password,
           funds: 1000.0
       });
       newUser.save(function(err){
          if(err){
              res.json({success: false, msg: 'Username already exists.'});
          }
              res.json({success: true, msg: 'New user created!'});
       });
   }
});
app.use('/api', apiRoutes);

app.listen(port);
console.log('Listening at port ' + port);
