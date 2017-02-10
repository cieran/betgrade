// Bruteforce Handling
var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore();

module.exports = {

    failCallback : function (req, res, next, nextValidRequestDate) {
        req.flash('error', "You've made too many failed attempts in a short period of time, please try again "+moment(nextValidRequestDate).fromNow());
        res.redirect('/'); // brute force protection triggered, send them back to the login page 
    };
    var stopThem = new ExpressBrute(store, {
        freeRetries:2, 
        refreshTimeoutOnRequest: false,
        minWait: 1000 * 60,
        maxWait: 1000 * 60 * 10,
        failCallback: failCallback
    });

};