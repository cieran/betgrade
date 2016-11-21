var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentNumberSchema = new Schema({
    number: {
        type: String,
        unique: true,
    },
    used: {
        type: Boolean
    }
}, {collection: 'users'});

module.exports = mongoose.model('StudentNumber', StudentNumberSchema);
