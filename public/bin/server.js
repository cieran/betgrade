var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('betgrade.co:27017/betgrade');
var Schema = mongoose.Schema;
var User = require('../models/user');
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var app = require('../app');
//var Post = require('../models/post');


var port = process.env.PORT || 3000;
app.listen(port);
console.log('Node Server Running @ Port: ' + port);


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



router.get('/signup', function(req, res){
    res.render('signup');
});
router.post('/signup', function (req, res) {
  User.register(new User({ 
      username: req.body.username,
      password: req.body.password,
      funds: 1000
  }), 
    function (err, newUser) {
      if(err){
          console.log(err);
      }
      passport.authenticate('local')(req, res, function() {
        res.send('signed up!!!');
      });
    }
  );
});