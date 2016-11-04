var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
        
    },
    password: {
        type: String,
        required: true
    },
    funds: {
        type: Number
    }
}, {collection: 'users'});
//UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);
module.exports = User;
