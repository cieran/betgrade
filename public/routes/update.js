var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

/*
	var side = bet.bet;
	var market = bet.market;
	var student = bet.student;
	var stake = bet.stake;

*	"Pairing Algorithm"
*	Lookup all unpaired bets from Bets order from oldest to newest
	stake = stake
	sop = sum of paired stakes
	soos = sum of opposite side
	if (stake + sop < soos)
		paired
	else
		unpaired
*/
setInterval(function() {
	var stake = Bet.find({"paired" : false}, {_id:0, bet:1, market:1, student:1, stake:1}).sort({createdAt : 1}).limit(1)
		.then(function(doc){
			return doc[0].stake;
	});
	console.log(stake);
},2500);