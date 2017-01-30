var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

/*
*	"Pairing Algorithm"
*	Lookup all unpaired bets from Bets order from oldest to newest
	stake = stake
	sop = sum of paired stakes
	soos = sum of opposite side
	if (stake + sop < soos)
		paired
	else
		unpaired

var bookIds = db.likes.find({userId:100}).map(function(like) { 
  return like.bookId; 
});
var books = db.books.find({_id:{$in:bookIds}});

*/
setInterval(function() {
	var stake = Bet.find({"paired" : false}, {_id:0, bet:1, market:1, student:1, stake:1}).sort({createdAt : 1}).limit(1)
		.then(function(doc){
			return doc.stake;
	});
	console.log(stake.stake);
},2500);