var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MarketSchema = new Schema({
    marketname: String,
    student: String,
    back: Number,
    lay: Number,
    btotal: Number,
    ltotal: Number,
    filename: String,
    code: Number
}, {collection: 'markets'});

module.exports = mongoose.model('Market', MarketSchema);

