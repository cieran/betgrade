var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    student: String,
    filename: String,
    bio: String,
    course: String
}, {collection: 'students'});

var Student = mongoose.model('Student', StudentSchema);