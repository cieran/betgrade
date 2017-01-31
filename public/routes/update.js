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
module.exports = {
	pairing : function(){
		Bet.find({"paired" : false}, {_id:0, bet:1, market:1, student:1, stake:1}).sort({createdAt : 1}).limit(1)
			.then(function(err, doc){
				if(err){
					console.log(err);
				}
				var result = doc[0];
				console.log("RESULTS: " + result);
				var stake = result.stake;
				var market = result.market;
				var student = result.student;
				var side = result.bet;
				console.log("Stake: " + stake);
				console.log("Side: " + side);
				Market.find({"student" : student, "marketname":market}).then(function(error, results){
					if(error){
						console.log(error);
					}
					console.log("Here come the results...." + results);
				});
		});
	}

};
/*
setInterval(function() {
	var stake = 0;
	stake = Bet.find({"paired" : false}, {_id:0, bet:1, market:1, student:1, stake:1}).sort({createdAt : 1}).limit(1)
		.then(function(doc){
			var temp = doc[0].stake;
			console.log("Temp: " + temp);
			return temp;
	});
	console.log(stake);
},2500);
*/