var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    username: {
        type: String        
    },
    password: {
        type: String,
    },
    funds: {
        type: Number
    },
    number: {
        type: Number
    },
    used: {
        type: Boolean
    },
    profit: {
        type: Number
    }
}, {collection: 'users', timestamps: true});

UserSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}


UserSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);
