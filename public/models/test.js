var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
    marketname: String,
    student: String,
    side: String,
    odds: Number,
    total: {type: Number, default: 0},
    filename: String,
    code: Number,
    course: String
}, {collection: 'test'});

module.exports = mongoose.model('Test', TestSchema);

