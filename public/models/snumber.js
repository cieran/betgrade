var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentNumberSchema = new Schema({
    snumber: {
        type: String,
        unique: true,
        required: true 
    },
    used: {
        type: Boolean,
        required: true
    }
}, {collection: 'snumbers'});

module.exports = mongoose.model('StudentNumber', StudentNumberSchema);
