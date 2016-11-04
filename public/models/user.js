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

UserSchema.pre('register', function(next){
    var user = this;
    if(this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function(err, salt){
            if(err){
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash){
                if(err){
                    return next(err);
                }
                user.password = hash;
                next();
            
            });
        });
    } else{
        return next();
    }
});

UserSchema.methods.comparePassword = function(pass, cb){
    bcrypt.compare(pass, this.password, function(err, isMatch){
        if(err){
            return cb(err);
        }
        cb(null, isMatch);
        
    });
};

module.exports = mongoose.model('User', UserSchema);
