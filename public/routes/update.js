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
*/
module.exports = {
	match : function(){
		Bet.find({"paired" : false}, {_id:0, bet:1, market:1, student:1, stake:1}).sort({createdAt : 1}).limit(1)
			.then(function(doc){
				var result = doc[0];
				var stake = result.stake;
				var market = result.market;
				var student = result.student;
				var side = result.bet;
				Market.find({"student" : student, "marketname":market}, {_id:0, student:1, marketname:1, btotal:1, ltotal:1}).then(function(results){
					var us, opp;
					var can_pair = false;
					if(side == 'Back'){
						us = results[0].btotal;
						os = results[0].ltotal;
					}else{
						us = results[0].ltotal;
						os = results[0].btotal;
					}
					
				});

		});
	}

	settle : function(marketname, student, ){

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