var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var session = require('express-session');
var db = require('./config/database.js');
var moment = require('moment');
var tz = require('moment-timezone');
var https = require('https');
var http = require('http');
var fs = require('fs');
var favicon = require('serve-favicon');
var options = {
  key: fs.readFileSync('../certs/server.key'),
  cert: fs.readFileSync('../certs/server.crt')
};

require('./config/passport')(passport);
mongoose.connect(db.database);
// Just a function to switch the timezones to Irish time when storing in the database
var hbs = exphbs.create({
    helpers: {
        inc : function(value) { return parseInt(value) + 1;},
        curr_round : function(value) {return Math.round(value * 100) / 100},
        date: function(date){  return moment(date).tz('Europe/Dublin').format('DD-MM-YY HH:mm');},
        ifeq: function(a, b, options){
            if(a === b)
                return options.fn(this);
        }
    },
    extname: 'hbs', 
    defaultLayout: 'layout', 
    layoutsDir: __dirname + '/views/layouts/'
});

// Creating View Engine which will render Handlebar files
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'assets')));

app.use(favicon(__dirname + '/assets/img/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: 'lionelrichie',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/index.js')(app, passport);


https.createServer(options, app).listen(port, function(){
  console.log('Node HTTPS Server on Port ' + port);
});

/*
http.createServer(app).listen(port, function(){
  console.log('Node HTTP Server on Port ' + port);
});
*/
// Boring error handling down here
app.use(function(req, res, next) {
  var err = new Error("The page you are looking for may not exist.");
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  res.status(500);
  res.render('error', {
    message: "That page will exist. Someday.",
    error: {}
  });
});



