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

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
    }));

    app.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/');
    });

};