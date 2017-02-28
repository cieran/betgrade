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
	calcReturns: function(x){
        if(x.bet == "Back"){
            x.potential_returns = x.stake * x.odds;
        }else{
            x.potential_returns = x.stake * 2;
        }
	},	
	static_calcReturns: function(bet, stake, odds){
        if(bet == "Back"){
            return stake * odds;
        }else{
            return stake + stake;
        }
	},
	cashoutCalc: function(x){
		var ret = Number.parseFloat(object.static_calcReturns(x.bet, x.stake, x.odds));
			if(x.bet == "Back"){
				Market.find({marketname : x.market, student: x.student}).sort({ltotal:-1}).limit(1)
				.exec(function(errs, doc){
					if(errs)
						return console.log(errs);
					if(!doc.length){
						x.cashout = x.stake - 0.1;
						x.returns = -0.1;
					}else{
						var aL = (x.odds / doc[0].lay) * x.stake;
						var aL_round = Math.round(aL * 100) / 100;
						var returns = Math.round((aL_round - x.stake)*100)/100;						
						var cashout = Math.round((x.stake + returns) * 100)/100;
						x.cashout = cashout;
						x.returns = returns;
					}
				});
			}else{
				Market.find({marketname : x.market, student: x.student}).sort({btotal:-1}).limit(1)
				.exec(function(errs, doc){
					if(errs)
						return console.log(errs);
					if(!doc.length){
						x.cashout = x.stake - 0.1;
						x.returns = -0.1;
					}else{
						var aB = (x.odds / doc[0].back) * x.stake;
						var aB_round = Math.round(aB * 100) / 100;
						var returns = Math.round((x.stake - aB_round)*100)/100;
						var cashout = Math.round((x.stake + returns) * 100)/100;
						x.cashout = cashout;
						x.returns = returns;
					}
				});
			}
	},
	findValue: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname, "btotal":{$gt : 0}}).sort({btotal: -1}).limit(1)
			.then(function(doc){
				var res = doc[0];
				if(res == null){
					x.mostPopularOdds = 0;
					x.mostPopularBtotal = 0;
				}else{
					x.mostPopularOdds = res.back;
					x.mostPopularBtotal = res.lavail;
				}

			});
	},
	findValueBelow: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname, "btotal":{$gt : 0}}).sort({btotal: -1}).limit(1).exec()
			.then(function(ret){
				if(ret == null){
					var mostPopularOdds = 0;
					var mostPopularBtotal = 0;
				}else{
					var mostPopularBtotal = ret[0].btotal;
					var mostPopularOdds = ret[0].back;
				}
				Market.find({"student" : x.student, "marketname": x.marketname, "back" : {$lt : mostPopularOdds}, "lavail":{$gt: 0}}).sort({back: -1}).limit(1)
		        	.then(function(doc){
		        		var res = doc[0];
		        		if(res == null){
		        			x.valueBelowOdds = 0;
		        			x.valueBelowBtotal = 0;
		        		}else{
				            x.valueBelowOdds = res.back;
				            x.valueBelowBtotal = res.lavail;
				        }
			        });
			});
     	
	},
	findValueAbove: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname, "btotal":{$gt : 0}}).sort({btotal: -1}).limit(1)
			.then(function(ret){
				if(ret == null){
					var mostPopularOdds = 0;
					var mostPopularBtotal = 0;
				}else{
					var mostPopularBtotal = ret[0].btotal;
					var mostPopularOdds = ret[0].back;
				}
	    		Market.find({"student" : x.student, "marketname": x.marketname, "lay" : {$gt : mostPopularOdds}, "bavail":{$gt:0}}).sort({lay: -1}).limit(1)
	         	.then(function(doc){
	         	var res = doc[0];
	         	if(res == null){
	         		x.valueAboveOdds = 0;
	             	x.valueAboveLtotal = 0;
	         	}else{
	         		x.valueAboveOdds = res.lay;
	             	x.valueAboveLtotal = res.bavail;
	         	}
	         });
	        });
	},
	findValueAboveAbove : function(x){
		Market.find({"student" : x.student, "marketname": x.marketname, "btotal":{$gt : 0}}).sort({btotal: -1}).limit(1)
			.then(function(ret){
				if(ret == null){
					var mostPopularOdds = 0;
					var mostPopularBtotal = 0;
				}else{
					var mostPopularBtotal = ret[0].btotal;
					var mostPopularOdds = ret[0].back;
				}
	    		Market.find({"student" : x.student, "marketname": x.marketname, "lay" : {$gt : mostPopularOdds},"bavail":{$gt:0}}).sort({lay: -1}).skip(1).limit(1)
		         .then(function(doc){
		         	var res = doc[0];
		         	if(res == null){
		         		x.valueAboveAboveOdds = 0;
		             	x.valueAboveAboveLtotal = 0;
		         	}else{
		         		x.valueAboveAboveOdds = res.lay;
		             	x.valueAboveAboveLtotal = res.bavail;
		         	}
		         });
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