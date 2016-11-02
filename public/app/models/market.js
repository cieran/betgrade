var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var MarketSchema = new Schema({
    marketname: String,
    markettype: String,
    A: Number,
    B: Number,
    C: Number,
    D: Number,
    E: Number,
    total: Number,
    settled: Boolean
}, {collection: 'markets'});

var Market = mongoose.model('Market', BetSchema);

router.get('/', function(req, res, next){
    Market.find()
        .then(function(doc){
        res.render('index', {items: doc});
    });
});


module.exports = mongoose.model('Market', MarketSchema);
