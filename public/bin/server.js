var express = require('express');
var mongoose = require('mongoose');
mongoose.connect('betgrade.co:27017/betgrade');
var Schema = mongoose.Schema;
var passport = require('passport');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var app = require('../app');

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Node Server Running @ Port: ' + port);





