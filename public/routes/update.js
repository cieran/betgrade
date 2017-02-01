var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

module.exports = {
	match : function(){
		Bet.find({"paired" : false}, {_id:0, bet:1, market:1, odds:1, student:1, to_match:1, stake:1}).sort({createdAt : 1}).limit(1)
			.then(function(doc){
				var result = doc[0];
				var stake = result.stake;
				var odds = result.odds;
				var market = result.market;
				var student = result.student;
				var side = result.bet;
				var to_match = result.to_match;
				console.log("we up here");
				Market.find({"student" : student, "marketname":market}, {_id:0, student:1, marketname:1, btotal:1, ltotal:1}).then(function(results){
					for(var i = 0; i < results.length; i++){
						console.log("Result " + i + ": " + results[i]);
					}
					/*
					var us, opp;
					var can_pair = false;
					console.log(side);
					if(side == "Back"){
						us = results[0].btotal;
						opp = results[0].ltotal;
					}else{
						us = results[0].ltotal;
						opp = results[0].btotal;
					}
					var docArray = results[0].toArray();
					console.log("doc 0: " + docArray[0]);
					console.log("doc 1: " + docArray[1]);
					*/
				});

		});
	},
	settle : function(){
			return null;
	}


};

/*	
	Returns
	Winning Back Bet - 		(Stake * (Odds - 1)) + Stake 
	Losing Back Bet - 		Stake
	Winning Lay Bet -		Stake + Stake
	Losing Lay Bet -		Stake * (Odds - 1)

	Cashout Rules	
	Back bet placed at Odds X1 for stake Y1 with Profit Z1
	Lay at new Odds X2 for stake Y1 with Profit Z2
	Difference = Profit Z1 - Profit Z2
	Difference / Odds X2 = Cashout Value
	Stake Y2 = Y1 + Cashout Value
	Lay at New Odds X2 for Stake Y2

	Back/Lay Outcomes:
	1) Back bet Wins, Returns Z1 - Liability from Lay Bet = Cashout
	2) Lay bet Wins, Returns Stake Y2 Profit - Loss from Back Bet = Cashout
*/


/*
setInterval(function() {
},2500);
*/