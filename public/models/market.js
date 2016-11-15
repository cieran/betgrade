var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MarketSchema = new Schema({
    marketname: String,
    student: String,
    back: Number,
    lay: Number,
    bio: String,
    course: String,
    filename: String
}, {collection: 'markets'});

var Market = mongoose.model('Market', MarketSchema);

