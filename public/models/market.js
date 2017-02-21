var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MarketSchema = new Schema({
    marketname: String,
    student: String,
    back: Number,
    lay: Number,
    btotal: {type: Number, default: 0.0},
    ltotal: {type: Number, default: 0.0},
    filename: String,
    code: Number,
    course: String
}, {collection: 'markets'});

module.exports = mongoose.model('Market', MarketSchema);

