var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var app = require('../app');
//var Post = require('../models/post');
var User = require('../models/user');
app.use(cookieParser());
app.use(session({
    secret: 'lionelrichie',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var port = process.env.PORT || 3000;
app.listen(port);
console.log('Node Server Running @ Port: ' + port);


