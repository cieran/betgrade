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
var User = require('./app/models/user');
var port = process.env.PORT || 3000;
var app = express();

//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/', function(req, res){
    res.send('hello, API at http://localhost:' + port + '/api');
});
app.listen(port);
console.log('Listening at port ' + port);
