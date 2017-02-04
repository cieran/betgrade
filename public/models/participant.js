var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParticipantSchema = new Schema({
    student: String,
    filename: String,
    course: String,
    code: Number
}, {collection: 'participants'});

module.exports = mongoose.model('Participant', ParticipantSchema);