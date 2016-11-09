var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = function(app){
app.get('/markets/:filename', function(req, res, next){
        var filename = req.params.filename;
        Market.find({"filename" : filename})
            .then(function(doc){
                res.render(filename, {title: 'Markets', markets: doc, user: req.user});
        });
 });
    
};

module.exports = router;