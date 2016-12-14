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
require('./config/passport')(passport);
mongoose.connect(db.database);

// Creating View Engine which will render Handlebar files

var hbs = exphbs.create({
    helpers: {
        inc : function(value) { return parseInt(value) + 1;},
        date: function(date){  return moment(date).tz('Europe/Dublin').format('DD-MM-YYYY hh:mm');},
        ifeq: function(a, b){
            console.log(a + "" + b);
            if(a === b)
                return a;
            else
                return "invalid";
        }
    },
    extname: 'hbs', 
    defaultLayout: 'layout', 
    layoutsDir: __dirname + '/views/layouts/'
});
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'assets')));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: 'lionelrichie',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/index.js')(app, passport);

/**
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var a = https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(port);
**/

app.listen(port);
console.log('Node Server Running @ Port: ' + port);

// Boring error handling down here
app.use(function(req, res, next) {
  var err = new Error("where do you think you're going?");
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



