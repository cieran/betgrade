var express = require('express');

var app = require('../app');
//var Post = require('../models/post');


var port = process.env.PORT || 3000;
app.listen(port);
console.log('Node Server Running @ Port: ' + port);


