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
			Bet.find({"student":student, "odds":odds, "market":market, "paired":false, "settled":false, 
			"bet": {$ne : side}, "_id" : {$ne : id}, "stake" : {$gte : stake}}).sort({createdAt: 1}).exec(function(errs, res){
			async.forEach(res, function(opp_doc, callback2){
				var temp_to_match = to_match;
				var opp_id = opp_doc._id;
				var opp_student = opp_doc.student;
				var opp_paired = opp_doc.paired;
				var opp_to_match = opp_doc.to_match;
				var opp_settled = opp_doc.settled;
				if(temp_to_match <= opp_to_match){
					var update_to_match = temp_to_match - opp_to_match;
					var update_opp_to_match = opp_to_match - temp_to_match;
					if(update_to_match <= 0){
						paired = true;
						update_to_match = 0;
					}
					if(update_opp_to_match <= 0){
						opp_paired = true;
						update_opp_to_match = 0;
					}
					Bet.update({"_id" : id}, 
						{$set : {'to_match': update_to_match,'paired' : paired}}
						,{new : true, multi: true}).exec(function(err){
							if(err)
								throw err;
						});
					Bet.update({"_id" : opp_id}, 
						{$set : {'to_match': update_opp_to_match, 'paired' : opp_paired}}
						,{new : true, multi:true}).exec(function(err){
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

	calcReturns: function(x){
        if(x.bet == "Back"){
            x.potential_returns = x.stake * x.odds + x.stake;
            console.log(x.student + ", " + x.bet + ", " + x.potential_returns);
        }else{
            x.potential_returns = x.stake * 2;
            console.log(x.student + ", " + x.bet + ", " + x.potential_returns);
        }
	},

	cashout_value: function(x){
		if(x.bet == "Back"){
		Market.find({"marketname" : x.market, "student" : x.student}).sort({btotal:-1}).limit(1)
		.then(function(doc){
			var calc_lay_profit = doc.odds * x.stake - x.stake;
			var pot_returns = calcReturns(x) - x.stake;
			var diff = pot_returns - calc_lay_profit;
			x.cashout = diff / doc.odds;

			return x.cashout;
		});
		}
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