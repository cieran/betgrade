var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentNumberSchema = new Schema({
    number: {
        type: String,
        unique: true,
        required: true 
    },
    used: {
        type: Boolean,
    }
}, {collection: 'snumbers'});

module.exports = mongoose.model('StudentNumber', StudentNumberSchema);
