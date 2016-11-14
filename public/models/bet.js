var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BetSchema = new Schema({
    market: String,
    bet: String,
    amount: Number,
    odds: Number,
    user: String,
    settled: Boolean
}, {collection: 'bets'});

var Bet = mongoose.model('Bet', BetSchema);

