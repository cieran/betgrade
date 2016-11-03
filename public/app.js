var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var routes = require('./routes/index');

var app = express();

// Creating View Engine which will render Handlebar files
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

app.use('/', routes);


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

module.exports = app;




var MongoLive = require('mongo-live');
var coffee = require('coffee-script');
var live = new MongoLive({
  host: 'betgrade.co',
  port: 27017,
  database: 'betgrade'
});

var posts = live
.query('markets')
.select('marketname filename A B')
.exec(function (error, stream) {

  stream.on('data', function (data) {

    if (error) {
      // handle error
      return;
    }

    if ('insert' === data.operation) {
      console.log('inserted', data);
    }

    if ('update' === data.operation) {
      console.log('updated', data);
    }

    if ('remove' === data.operation) {
      console.log('removed', data);
    }

    console.log('======== result ======>', data);

  });

});