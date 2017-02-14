var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

var object = {
	match : function(pside, pmarketname, pstudent, podds){
		Bet.find({"paired" : false, "settled":false, "market":pmarketname, "bet":pside, "student":pstudent, "odds": podds}, {_id:1, bet:1, market:1, odds:1, student:1, to_match:1, stake:1})
		.sort({createdAt : 1}).limit(1).exec(function(err, results){
		async.forEach(results, function(doc, callback){
			console.log("out");
			var id = doc._id;
			var stake = doc.stake;
			var odds = doc.odds;
			var market = doc.market;
			var student = doc.student;
			var side = doc.bet;
			var to_match = doc.to_match;
			var paired = doc.paired;
			Bet.find({"student":student, "odds":odds, "market":market, "paired":false, "settled":false, 
			"bet": {$ne : side}, "_id" : {$ne : id}}).sort({createdAt: 1}).limit(1).exec(function(errs, res){
			async.forEach(res, function(opp_doc, callback2){
			console.log("in");
				var temp_to_match = to_match;
				var opp_id = opp_doc._id;
				var opp_student = opp_doc.student;
				var opp_paired = opp_doc.paired;
				var opp_to_match = opp_doc.to_match;
				var opp_settled = opp_doc.settled;
				console.log("to_match: " + to_match);
				console.log("Is " + id + " lteq " + opp_id + " ???");
				console.log("Is " + temp_to_match + " lteq " + opp_to_match + " ???");
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
						Bet.findOneAndUpdate({"_id" : id}, 
							{$set : {'to_match': update_to_match,'paired' : paired}}
							,{new : true}).exec(function(err, res){
								if(err)
									throw err;
								if(res.to_match != 0){
									object.match(side, market, student, odds);
								}
								
							});
						Bet.findOneAndUpdate({"_id" : opp_id}, 
							{$set : {'to_match': update_opp_to_match, 'paired' : opp_paired}}
							,{new : true}).exec(function(err){
								if(err)
									throw err;
							});

						
						
			}, callback);
		}, function(err){
			console.log("done matching bets");
		})})});
	},
	update_odds_availability : function(){
		console.log("we in the funct");
	},
	calcReturns: function(x){
        if(x.bet == "Back"){
            x.potential_returns = x.stake * x.odds;
        }else{
            x.potential_returns = x.stake * 2;
        }
	},	
	static_calcReturns: function(bet, stake, odds){
        if(bet == "Back"){
            return stake * odds + stake;
        }else{
            return stake * 2;
        }
	},
	cashout_value: function(x){
		if(x.bet == "Back"){
			Market.find({"marketname" : x.market, "student" : x.student}).sort({ltotal:-1}).limit(1)
			.then(function(doc){
				var liability = Math.round((((doc[0].back * x.stake) - x.stake) * 100)/100);
		        var returns = x.stake * x.odds;
				var profit = returns - x.stake;
				var diff = profit - liability;
				var cashout_long = x.stake + (diff / doc[0].back);
				var cashout = Math.round(cashout_long * 100) / 100;
				x.cashout = cashout;
				x.returns = cashout - x.stake;
			});
		}else{
			Market.find({"marketname" : x.market, "student" : x.student}).sort({btotal:-1}).limit(1)
			.then(function(doc){
				var liability = Math.round((((doc[0].back * x.stake) - x.stake) * 100)/100);
		        var returns = x.stake + x.stake;
				var profit = returns - x.stake;
				var diff = profit - liability;
				var cashout_long = x.stake + (diff / doc[0].back);
				var cashout = Math.round(cashout_long * 10 ) / 10;
				x.cashout = cashout;
				x.returns = cashout - x.stake;
			});
		}
	},
	find : function(x){

	},
	findValue: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname}).sort({btotal: -1}).limit(1)
			.then(function(doc){
				var res = doc[0];
				x.mostPopularOdds = res.back;
				x.mostPopularBtotal = res.btotal;
				object.findValueBelow(x.student, x.marketname, x.mostPopularBtotal);
				object.findValueAbove(x.student, x.marketname, x.mostPopularBtotal);
				object.findValueAboveAbove(x.student, x.marketname, x.mostPopularBtotal);
				console.log("Student: " + res.student);
				console.log("   Best Odds: " + res.back + ", Best Backed: " + res.btotal);
			});

	},
	findValueBelow: function(student, market, mostBacked){
     	Market.find({"student" : student, "marketname": market, "back" : {$lte : mostBacked}}).sort({odds: -1}).limit(1)
        	.then(function(doc){
        		var res = doc[0];
	             x.valueBelowOdds = res.back;
	             x.valueBelowBtotal = res.btotal;
	         });
	},
	findValueAbove: function(student, market, mostBacked){
	    Market.find({"student" : student, "marketname": market, "back" : {$gte : mostBacked}}).sort({odds: 1}).limit(1)
	         .then(function(doc){
	         	var res = doc[0];
	             x.valueAboveOdds = res.lay;
	             x.valueAboveLtotal = res.ltotal;
	         });
	},
	findValueAboveAbove : function(student, market, mostBacked){
	    Market.find({"student" : student, "marketname": market, "back" : {$gte : mostBacked}}).sort({odds: 1}).skip(1).limit(1)
	         .then(function(doc){
	         	var res = doc[0];
	         	 x.valueAboveAboveOdds = res.lay;
	             x.valueAboveAboveLtotal = res.ltotal;
	         });
	             
	}
};

module.exports = object;

/*	
	Returns
	Winning Back Bet - 		(Stake * (Odds - 1)) + Stake 
	Losing Back Bet - 		Stake
	Winning Lay Bet -		Stake + Stake
	Losing Lay Bet -		Stake * (Odds - 1)

	Cashout Rules	
	Back bet placed at Odds X1 for stake Y1 with Profit Z1
	Lay at new Odds X2 for stake Y1 with Liability Z2
	Difference = Profit Z1 - Liability Z2
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