var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

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

UserSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

UserSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(passport, this.password);
}

module.exports = mongoose.model('User', UserSchema);
