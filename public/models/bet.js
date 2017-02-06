var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BetSchema = new Schema({
    bet: String,
    marketname: String,
    student: String,
    paired: Boolean,
    to_match: Number,
    odds: Number,
    stake: Number,
    potential: Number,
    username: String,
    settled: Boolean
}, {collection: 'bets', timestamps: true});

module.exports = mongoose.model('Bet', BetSchema);

