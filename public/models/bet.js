var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BetSchema = new Schema({
    bet: String,
    market: String,
    student: String,
    paired: Boolean,
    odds: Number,
    stake: Number,
    potential: Number,
    username: String,
    settled: Boolean
}, {collection: 'bets', timestamps: true});

module.exports = mongoose.model('Bet', BetSchema);

