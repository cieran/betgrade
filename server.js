'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var app = express();
//var app = require('./config/lib/app');

app.use(express.static(__dirname + '/public'));
app.listen(3000);
