var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

module.exports = {
	match : function(){
		async.forEach(Bet.find({"paired" : false}, {_id:1, bet:1, market:1, odds:1, student:1, to_match:1, stake:1})
		.sort({createdAt : 1}), function(doc, callback){
			var result = doc;
			var id = result._id;
			var stake = result.stake;
			var odds = result.odds;
			var market = result.market;
			var student = result.student;
			var side = result.bet;
			var to_match = result.to_match;
			async.forEach(Bet.find({"student":student, "market":market, "paired":false, "settled":false, 
				"bet": {$ne : side}, "_id" : {$ne : id}}), function(opp_doc, callback2){
				var temp_to_match = to_match;
				var array = opp_doc;
				var opp_id = array._id;
				console.log("Comparing " + id + " with " + opp_id);
				var opp_paired = array.paired;
				var opp_to_match = array.to_match;
				var opp_settled = array.settled;
				if(temp_to_match <= opp_to_match){
					temp_to_match -= opp_to_match;
					opp_to_match -= temp_to_match;
					if(temp_to_match <= 0){
						paired = true;

					}
					if(opp_to_match <= 0){
						opp_paired = true;
					}
				}
			}, callback);
		}, function(err){
			console.log("done");
		});
	},
	sync_match : function(){
		Bet.find({"paired" : false}, {_id:1, bet:1, market:1, odds:1, student:1, to_match:1, stake:1})
		.sort({createdAt : 1})
			.then(function(doc){
				for(var j = 0; j < doc.length; j++){
				var result = doc[j];
				var id = result._id;
				var stake = result.stake;
				var odds = result.odds;
				var market = result.market;
				var student = result.student;
				var side = result.bet;
				var to_match = result.to_match;
				Bet.find({"student":student, "market":market, "paired":false, "settled":false, 
					"bet": {$ne : side}, "_id" : {$ne : id}}).then(function(results){
					for(var i = 0; i < 2; i++){
						var temp_to_match = to_match;
						var array = results[i];
						var opp_id = array._id;
						console.log("Comparing " + id + " with " + opp_id);
						var opp_paired = array.paired;
						var opp_to_match = array.to_match;
						var opp_settled = array.settled;
						if(temp_to_match <= opp_to_match){
							temp_to_match -= opp_to_match;
							opp_to_match -= temp_to_match;
							if(temp_to_match <= 0){
								paired = true;

							}
							if(opp_to_match <= 0){
								opp_paired = true;
							}
						Bet.findOneAndUpdate({"_id" : id}, {$set : {'to_match': temp_to_match,'paired' : paired}}, {new : true});
						Bet.findOneAndUpdate({"_id" : opp_id}, {$set : {'to_match': opp_to_match, 'paired' : opp_paired}}, {new : true});
						}
					}

				});

		}});
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