var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

module.exports = {
	match : function(){
		Bet.find({"paired" : false}, {_id:1, bet:1, market:1, odds:1, student:1, to_match:1, stake:1})
		.sort({createdAt : 1}).exec(function(err, results){
		async.forEach(results, function(doc, callback){
			var id = doc._id;
			var stake = doc.stake;
			var odds = doc.odds;
			var market = doc.market;
			var student = doc.student;
			var side = doc.bet;
			var to_match = doc.to_match;
			Bet.find({"student":student, "market":market, "paired":false, "settled":false, 
			"bet": {$ne : side}, "_id" : {$ne : id}}).exec(function(errs, res){
			async.forEach(res, function(opp_doc, callback2){
				var temp_to_match = to_match;
				var opp_id = opp_doc._id;
				var opp_student = opp_doc.student;
				var opp_paired = opp_doc.paired;
				var opp_to_match = opp_doc.to_match;
				var opp_settled = opp_doc.settled;
				if(temp_to_match <= opp_to_match){
					temp_to_match -= opp_to_match;
					opp_to_match -= temp_to_match;
					if(temp_to_match <= 0){
						temp_to_match = 0;
						paired = true;

					}
					if(opp_to_match <= 0){
						opp_to_match = 0;
						opp_paired = true;
					}
					Bet.update({"_id" : id}, 
						{$set : {'to_match': temp_to_match,'paired' : paired}}
						, {new : true, multi: true}).exec(function(err){
							if(err)
								throw err;
						});
					Bet.update({"_id" : opp_id}, 
						{$set : {'to_match': opp_to_match, 'paired' : opp_paired}}
						, {new : true, multi:true}).exec(function(err){
							if(err)
								throw err;
						});
				}
			}, function(err){
				if(err){
					throw err;
				}
				callback();
			})});
		}, function(err){
			console.log("done");
		})});
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