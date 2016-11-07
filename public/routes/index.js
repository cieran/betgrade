var BetSchema = new Schema({
    market: String,
    bet: String,
    amount: Number,
    odds: Number,
    user: String,
    settled: Boolean
}, {collection: 'bets'});

var Bet = mongoose.model('Bet', BetSchema);

var MarketSchema = new Schema({
    marketname: String,
    markettype: String,
    A: Number,
    B: Number,
    C: Number,
    D: Number,
    E: Number,
    filename: String,
    total: Number,
    settled: Boolean
}, {collection: 'markets'});

var Market = mongoose.model('Market', MarketSchema);

module.exports = function(app, passport){
    
    app.get('/', function(req, res, next){
        Market.find()
            .then(function(doc){
                res.render('index', {items: doc});
        });
    });

    app.get('/get-market', function(req, res, next){
        Market.find()
            .then(function(doc){
                res.render(this.filename);
        });
    });
    app.get('/signup', function(req, res){
        res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup',{
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash: true
    }));

    app.get('/login', function (req, res) {
      res.render('login', {message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local'), function (req, res) {
      res.send('logged in!!!');
    });

    app.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/');
    });

};