var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var BetSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    marketname: {
        type: String,
        required: true
    },
    option: {
        type: String,
        required: true
    },
    odds: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

